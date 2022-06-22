import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import {
  WATERMELON_HISTORY_COMMAND,
  WATERMELON_PULLS_COMMAND,
} from "../../constants";
import getNumberOfFileChanges from "../getNumberOfFileChanges";
import getPlural from "../others/text/getPlural";
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
        `#### Pull Requests`
      );
      content.appendMarkdown(`\n\n`);
<<<<<<< Updated upstream
=======
      content.appendMarkdown( `[Understand the code context](${startCommandUri}) with Watermelon 🍉`);
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(`The most relevant Pull Request is "IFO-332: Improve Render with WebGL" by **@b0rk** on *29/12/2020*`);
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(`#### Commits`);
      content.appendMarkdown(`\n\n`);
>>>>>>> Stashed changes
      content.appendMarkdown(
        `[View the history for this line](${blameCommandUri}) with Watermelon 🍉`
      );
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(`The latest commit is "${latestCommit.message}" by **${latestCommit.authorName}** on **${latestCommit.commitDate.toLocaleDateString()}**`);

      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(`#### Notion`);
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown( `[View docs](${startCommandUri}) with Watermelon 🍉`);
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(`The best documentation document is "RFC: Rendering using better APIs" by **Sebastian Matthews** on *18/11/2020*`);
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `This file has changed ${numberOfFileChanges} time${getPlural(
          numberOfFileChanges
        )}`
      );
      content.supportHtml = true;
      content.isTrusted = true;
      reporter.sendTelemetryEvent("hover");
      return new vscode.Hover(content);
    },
  });
};
export default hover;
