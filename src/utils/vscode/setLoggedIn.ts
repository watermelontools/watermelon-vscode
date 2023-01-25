import * as vscode from "vscode";

export default function setLoggedIn(loggedIn: boolean) {
  vscode.commands.executeCommand("setContext", "watermelon.isLogged", loggedIn);
}
