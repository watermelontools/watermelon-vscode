import * as vscode from "vscode";
let multiSelectCommandHandler = async (times = 4) => {
  for (let index = 0; index < times; index++) {
    vscode.commands.executeCommand("editor.action.smartSelect.expand");
  }
};
export default multiSelectCommandHandler;
