import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import {
  WATERMELON_HISTORY_COMMAND,
  WATERMELON_PULLS_COMMAND,
} from "../../constants";
import getNumberOfFileChanges from "../getNumberOfFileChanges";
import getGitAPI from "../vscode/getGitAPI";

const hover = ({ reporter }: { reporter: TelemetryReporter }) => {
  return vscode.languages.registerHoverProvider("*", {
    async provideHover(document, position, token) {
      let gitAPI = await getGitAPI();

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
      const blameCommandUri = vscode.Uri.parse(
        `command:${WATERMELON_HISTORY_COMMAND}?${encodeURIComponent(
          JSON.stringify(args)
        )}`
      );
      const content = new vscode.MarkdownString(
        `[Understand the code context](${startCommandUri}) with Watermelon 🍉`
      );
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `[View the history for this line](${blameCommandUri}) with Watermelon 🍉`
      );
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `This file has changed ${numberOfFileChanges} times`
      );
      content.supportHtml = true;
      content.isTrusted = true;
      reporter.sendTelemetryEvent("hover");
      return new vscode.Hover(content);
    },
  });
};
export default hover;
