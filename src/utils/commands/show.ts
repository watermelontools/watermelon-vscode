import * as vscode from "vscode";
let showCommandHandler = async () => {
  vscode.commands.executeCommand("watermelon.sidebar.focus");
};
export default showCommandHandler;
