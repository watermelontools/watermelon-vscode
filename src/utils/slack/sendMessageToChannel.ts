import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function getTicketComments({
  email,
  channelId,
  text,
}: {
    email: string,
    channelId: string
    text: string,
}) {
  const sentComment = await axios
    .post(`${backendURL}/api/slack/sendMessageToChannel`, {
        user: email,
        channelId,
        text,
      })
      .then((res) => res.data)
      .catch((err) => {
        let reporter = analyticsReporter();
        let { message } = err;
        reporter?.sendTelemetryException(err, { error: message });
      });
      return sentComment;
}
