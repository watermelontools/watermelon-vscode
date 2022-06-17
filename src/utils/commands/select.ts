import * as vscode from "vscode";
let selectCommandHandler = async () => {
  vscode.commands.executeCommand("editor.action.smartSelect.expand");
};

export default selectCommandHandler;
