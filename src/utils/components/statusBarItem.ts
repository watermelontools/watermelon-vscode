import * as vscode from "vscode";

const statusBarItem = () => {
  let item: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  item.command = "watermelon.start";

  return item;
};

function getNumberOfSelectedLines(
  editor: vscode.TextEditor | undefined
): number {
  let lines = 0;
  if (editor) {
    lines = editor.selections.reduce(
      (prev, curr) => prev + (curr.end.line - curr.start.line),
      0
    );
  }
  return lines;
}
export function updateStatusBarItem(
  myStatusBarItem: vscode.StatusBarItem
): void {
  const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
  if (n > 0) {
    myStatusBarItem.text = `Run Watermelon with the ${n} line${
      n > 1 ? "s" : ""
    } selected`;
    myStatusBarItem.tooltip = "Click here to run Watermelon";
    myStatusBarItem.command = "watermelon.start";
  } else {
    myStatusBarItem.text = `Open Watermelon to see code context`;
    myStatusBarItem.tooltip = "Watermelon: Select lines to view context";
    myStatusBarItem.command = "watermelon.show";
  }
  myStatusBarItem.show();
}
export default statusBarItem;
