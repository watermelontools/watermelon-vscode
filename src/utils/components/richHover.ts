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
          user: session?.account.label,
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

      if (foundHoverData?.github?.length > 0) {
        content.appendMarkdown(`<a href="${startCommandUri}">
        <span style="display:flex;align-items:center;">
        <img style="height:1em;max-height:1em;width:1em;max-width:1em;"
        src='${vscode.Uri.parse(
          path.join(
            __filename,
            "..",
            "..",
            "..",
            "..",
            "images",
            "logos",
            `githubSmall.svg`
          )
        )}' 
        />
         #${foundHoverData?.github[0].number}: ${
          foundHoverData?.github[0].title
        }
        </span>
      </a>`);
        content.appendMarkdown(`<br />`);
      }
      if (foundHoverData?.jira?.length > 0) {
        content.appendMarkdown(`<a href="${startCommandUri}">
        <span style="display:flex;align-items:center;">
        <img style="height:1em;max-height:1em;width:1em;max-width:1em;"
        src='${vscode.Uri.parse(
          path.join(
            __filename,
            "..",
            "..",
            "..",
            "..",
            "images",
            "logos",
            `jiraSmall.svg`
          )
        )}' 
        />
         ${foundHoverData?.jira[0].key}: ${
          foundHoverData?.jira[0].fields.summary.length > 50
            ? foundHoverData?.jira[0].fields.summary.slice(0, 50) + "..."
            : foundHoverData?.jira[0].fields.summary
        }
        </span>
      </a>`);
        content.appendMarkdown(`<br />`);
      }
      if (foundHoverData?.slack?.length > 0) {
        content.appendMarkdown(`<a href="${startCommandUri}">
        <span style="display:flex;align-items:center;">
        <img style="height:1em;max-height:1em;width:1em;max-width:1em;"
        src='${vscode.Uri.parse(
          path.join(
            __filename,
            "..",
            "..",
            "..",
            "..",
            "images",
            "logos",
            `slackSmall.svg`
          )
        )}'
        />
          #${foundHoverData?.slack[0].channel.name}: ${
          foundHoverData?.slack[0].text.length > 50
            ? foundHoverData?.slack[0].text.slice(0, 50) + "..."
            : foundHoverData?.slack[0].text
        }
        </span>
      </a>`);
        content.appendMarkdown(`<br />`);
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
