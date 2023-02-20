import * as vscode from "vscode";
import { WatermelonAuthenticationProvider } from "../../auth";
import postCommentOnIssue from "../github/postCommentOnIssue";
import analyticsReporter from "../vscode/reporter";
let commentOnGitHub = async (thread: any, email: string) => {
  const session = await vscode.authentication.getSession(
    WatermelonAuthenticationProvider.id,
    []
  );
  const githubComment = await vscode.window.showInputBox({
    title: `Commenting on: ${thread.description}`,
    placeHolder: `Enter your comment for ${thread.label}`,
    ignoreFocusOut: true,
  });
  if (githubComment) {
    let repo = thread.metadata.url.split("/")[4];
    let owner = thread.metadata.url.split("/")[3];
    const comment = await postCommentOnIssue({
      email: session?.account.label ?? "",
      comment_body: githubComment,
      owner,
      repo,
      issue_number: thread.metadata.number,
    });
    if (comment?.errorText) {
      vscode.window.showErrorMessage(comment.errorText);
    } else {
      vscode.window.showInformationMessage("Comment added successfully");
      let reporter = analyticsReporter();

      reporter?.sendTelemetryEvent("commentOnGithub", {
        email: session?.account.label ?? "",
      });
    }
  }
};
export default commentOnGitHub;
