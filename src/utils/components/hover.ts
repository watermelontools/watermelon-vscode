import * as vscode from "vscode";

const hover = ({
  reporter,
  numberOfFileChanges,
}: {
  reporter: any;
  numberOfFileChanges: number;
}) => {
  vscode.languages.registerHoverProvider("*", {
    provideHover(document, position, token) {
      const args = [{ startLine: position.line, endLine: position.line }];
      const startCommandUri = vscode.Uri.parse(
        `command:watermelon.start?${encodeURIComponent(JSON.stringify(args))}`
      );
      const blameCommandUri = vscode.Uri.parse(
        `command:watermelon.blame?${encodeURIComponent(JSON.stringify(args))}`
      );
      const content = new vscode.MarkdownString(
        `[Understand the code context](${startCommandUri}) with Watermelon 🍉`
      );
      const docsCommandUri = vscode.Uri.parse(`command:watermelon.docs?`);
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `[View the history for this line](${blameCommandUri}) with Watermelon 🍉`
      );
      content.appendMarkdown(`\n\n`);
      content.appendMarkdown(
        `[Get the docs for this file](${docsCommandUri}) with Watermelon 🍉`
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
