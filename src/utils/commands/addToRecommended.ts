import * as vscode from "vscode";
import { EXTENSION_ID } from "../../constants";
let addToRecommendedCommandHandler = async () => {
  vscode.commands.executeCommand(
    "workbench.extensions.action.addExtensionToWorkspaceRecommendations",
    EXTENSION_ID
  );
};
export default addToRecommendedCommandHandler;
