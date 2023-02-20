import * as vscode from "vscode";
import { WatermelonAuthenticationProvider } from "../../auth";
import postOnThread from "../slack/postOnThread";
import analyticsReporter from "../vscode/reporter";
let commentOnSlack = async (thread: any, email: string) => {
  const session = await vscode.authentication.getSession(
    WatermelonAuthenticationProvider.id,
    []
  );
  const slackComment = await vscode.window.showInputBox({
    title: `Commenting on: ${thread.description}`,
    placeHolder: `Enter your comment for ${thread.label}`,
    ignoreFocusOut: true,
  });
  if (slackComment) {
    const comment = await postOnThread({
      email: session?.account.label ?? "",
      text: slackComment,
      channelId: thread.metadata.channel.id,
      threadTS: thread.metadata.ts,
    });
    if (comment?.errorText) {
      vscode.window.showErrorMessage(comment.errorText);
    } else {
      vscode.window.showInformationMessage("Comment added successfully");
      let reporter = analyticsReporter();

      reporter?.sendTelemetryEvent("commentOnSlack", {
        email: session?.account.label ?? "",
      });
    }
  }
};
export default commentOnSlack;
