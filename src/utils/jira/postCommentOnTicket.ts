import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function postCommentOnTicket({
  email,
  issueIdOrKey,
  text,
}: {
  email: string;
  issueIdOrKey: string;
  text: string;
}) {
  const sentComment = await axios
    .post(`${backendURL}/api/jira/commentOnJiraTicket`, {
      user: email,
      issueIdOrKey,
      text,
    })
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });
  return sentComment;
}
