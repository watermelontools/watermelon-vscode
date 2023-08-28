import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import {
  WATERMELON_OPEN_LINK_COMMAND,
  WATERMELON_PULLS_COMMAND,
  backendURL,
} from "../../constants";
import getLatestCommit from "../others/git/getLatestCommit";
import getGitAPI from "../vscode/getGitAPI";
import axios from "axios";
import { WatermelonAuthenticationProvider } from "../../auth";
import getRepoInfo from "../vscode/getRepoInfo";
import path = require("path");

const hover = ({ reporter }: { reporter: TelemetryReporter | null }) => {
  return vscode.languages.registerHoverProvider("*", {
    async provideHover(document, position, token) {
      let gitAPI = await getGitAPI();
      let latestCommit = await getLatestCommit({
        startLine: position.line,
        endLine: position.line,
        currentlyOpenTabfilePath: document,
        gitAPI,
      });
      const session = await vscode.authentication.getSession(
        WatermelonAuthenticationProvider.id,
        []
      );
      let repoInfo = await getRepoInfo({ reporter });
      let gitSystem = repoInfo?.source;
      let repo = repoInfo?.repo;
      let owner = repoInfo?.owner;
      const foundHoverData = await axios
        .post(`${backendURL}/api/hover/getHoverData`, {
          email: session?.account.label,
          commitTitle: latestCommit.message.replace(/(\r\n|\n|\r)/gm, ""),
          repo,
          owner,
          gitSystem,
        })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
        });

      const args = [{ startLine: position.line, endLine: position.line }];
      const startCommandUri = vscode.Uri.parse(
        `command:${WATERMELON_PULLS_COMMAND}?${encodeURIComponent(
          JSON.stringify(args)
        )}`
      );
      const mailtoLinkCommandUri = vscode.Uri.parse(
        `command:${WATERMELON_OPEN_LINK_COMMAND}?${encodeURIComponent(
          JSON.stringify({
            url: `mailto:${latestCommit.authorEmail}`,
            source: "hover",
          })
        )}`
      );
      const content: vscode.MarkdownString = new vscode.MarkdownString(
        `### Watermelon Context 🍉`
      );
      content.appendMarkdown(`\n\n`);
      let { data } = foundHoverData;
      // now all services have the shape:
      /* {
        [serviceName]: {
          title: string;
         body?: string;
         link?: string;
         number?: number | string;
         image?: string;
      }[]
    } */
      for (const serviceName in data) {
        const service = data[serviceName];

        // Check if the service is an array and has items in it
        if (Array.isArray(service) && service.length > 0) {
          content.appendMarkdown(`<a href="${startCommandUri}">
              <span style='display:flex;align-items:center; height: 1em;'>
                  <img 
                  height="14px" 
                  width="14px" 
                  src='${vscode.Uri.parse(
                    path.join(
                      __filename,
                      "..",
                      "..",
                      "..",
                      "..",
                      "images",
                      "logos",
                      `${serviceName}.svg`
                    )
                  )}' 
                  />
                  ${service[0]?.number ? `#${service[0]?.number}:` : ""} ${
            service[0].title.length > 50
              ? service[0].title.slice(0, 50) + "..."
              : service[0].title
          }
              </span>
          </a>`);
          content.appendMarkdown(`<br />`);
        }
      }

      content.supportHtml = true;
      content.isTrusted = true;
      content.supportThemeIcons = true;
      reporter?.sendTelemetryEvent("richHover");
      return new vscode.Hover(content);
    },
  });
};
export default hover;
