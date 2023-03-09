import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import { WatermelonAuthenticationProvider } from "../../auth";
import { WATERMELON_PULLS_COMMAND } from "../../constants";
import getLatestCommit from "../others/git/getLatestCommit";
import getGitAPI from "../vscode/getGitAPI";
import path = require("path");
import searchMessagesByText from "../slack/searchMessagesByText";

const slackHover = ({ reporter }: { reporter: TelemetryReporter | null }) => {
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
      const args = [{ startLine: position.line, endLine: position.line }];
      const startCommandUri = vscode.Uri.parse(
        `command:${WATERMELON_PULLS_COMMAND}?${encodeURIComponent(
          JSON.stringify(args)
        )}`
      );
      const threads = await searchMessagesByText({
        email: session?.account.label || "",
        text: latestCommit.message.replace(/(\r\n|\n|\r)/gm, ""),
      });
      if (!threads) {
        return null;
      }
      const sortedThreads = threads?.sort(
        (a: any, b: any) => b?.replies?.length - a?.replies?.length
      );
      const lastThread = sortedThreads[0];
      const content: vscode.MarkdownString = new vscode.MarkdownString(
        `<a href="${startCommandUri}">
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
              `slack.svg`
            )
          )}' 
          />
           #${lastThread.channel.name}: ${
          lastThread.text.length > 50
            ? lastThread.text.slice(0, 50) + "..."
            : lastThread.text
        }
          </span>
        </a>`
      );

      content.supportHtml = true;
      content.isTrusted = true;
      content.supportThemeIcons = true;
      reporter?.sendTelemetryEvent("slackhover");
      return new vscode.Hover(content);
    },
  });
};
export default slackHover;
