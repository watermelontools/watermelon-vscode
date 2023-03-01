import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import {
  WATERMELON_OPEN_LINK_COMMAND,
  WATERMELON_PULLS_COMMAND,
} from "../../constants";
import getNumberOfFileChanges from "../getNumberOfFileChanges";
import getLatestCommit from "../others/git/getLatestCommit";
import getPlural from "../others/text/getPlural";
import getGitAPI from "../vscode/getGitAPI";

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
      let numberOfFileChanges = await getNumberOfFileChanges(
        document.uri.fsPath || ".",
        gitAPI as any
      );
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
        `<strong>
          <a href="${startCommandUri}">
            <span style="color:#fff;background-color:#238636;">
              &nbsp;$(github-inverted)View the code context with Watermelon 🍉&nbsp;&nbsp;
            </span>
          </a>
        </strong>`
      );
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `The latest commit was made by [$(mail)${
          latestCommit.authorName
        }](${mailtoLinkCommandUri}) on **${latestCommit.commitDate.toLocaleDateString()}**:
        `
      );
      content.appendMarkdown(`\n`);
      content.appendMarkdown(latestCommit.message.split("\n")[0]);
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(latestCommit.message.split("\n")[1] || "");
      content.appendMarkdown(`\n\n`);
      if (latestCommit.message.split("\n").length > 2) {
        content.appendMarkdown(
          `$(git-commit)[See the other ${
            latestCommit.message.split("\n").length - 2
          } commit message lines](${startCommandUri})`
        );
        content.appendMarkdown(`\n\n`);
      }
      content.appendMarkdown(
        `This file has changed ${numberOfFileChanges} time${getPlural(
          numberOfFileChanges
        )}`
      );
      content.supportHtml = true;
      content.isTrusted = true;
      content.supportThemeIcons = true;
      reporter?.sendTelemetryEvent("hover"); 
      return new vscode.Hover(content);
    },
  });
};
export default hover;
