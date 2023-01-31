import * as vscode from "vscode";

export default function setLoggedIn(loading: boolean) {
  vscode.commands.executeCommand("setContext", "watermelon.isLoading", loading);
}
