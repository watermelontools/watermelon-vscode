import * as vscode from "vscode";
import { WatermelonAuthenticationProvider } from "../../auth";
import postCommentOnTicket from "../jira/postCommentOnTicket";
import analyticsReporter from "../vscode/reporter";
let commentOnJira = async (issueIdOrKey: any, email: string) => {
  const session = await vscode.authentication.getSession(
    WatermelonAuthenticationProvider.id,
    []
  );
  const jiraComment = await vscode.window.showInputBox({
    title: `Commenting on: ${issueIdOrKey.description}`,
    placeHolder: `Enter your comment for ${issueIdOrKey.label}`,
    ignoreFocusOut: true,
  });
  if (jiraComment) {
    const comment = await postCommentOnTicket({
      email: session?.account.label ?? "",
      issueIdOrKey: issueIdOrKey.label,
      text: jiraComment,
    });
    if (comment?.errorText) {
      vscode.window.showErrorMessage(comment.errorText);
    } else {
      vscode.window.showInformationMessage("Comment added successfully");
      let reporter = analyticsReporter();

      reporter?.sendTelemetryEvent("commentOnJira", {
        email: session?.account.label ?? "",
      });
    }
  }
};
export default commentOnJira;
