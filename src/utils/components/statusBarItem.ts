import * as vscode from "vscode";
import {
  WATERMELON_PULLS_COMMAND,
  WATERMELON_SHOW_COMMAND,
} from "../../constants";

const statusBarItem = () => {
  let item: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  item.command = WATERMELON_PULLS_COMMAND;

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
    myStatusBarItem.command = WATERMELON_PULLS_COMMAND;
  } else {
    myStatusBarItem.text = `Open Watermelon to see code context`;
    myStatusBarItem.tooltip = "Watermelon: Select lines to view context";
    myStatusBarItem.command = WATERMELON_SHOW_COMMAND;
  }
  myStatusBarItem.show();
}
export default statusBarItem;
