import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function getTicketComments({
  email,
  channelId,
  text,
  threadTS,
  broadcast
}: {
    email: string,
    channelId: string
    text: string,
    threadTS: string,
    broadcast?: string,
}) {
  const sentComment = await axios
    .post(`${backendURL}/api/slack/addMessageToThread`, {
        user: email,
        channelId,
        text,
        threadTS,
        broadcast
      })
      .then((res) => res.data)
      .catch((err) => {
        let reporter = analyticsReporter();
        let { message } = err;
        reporter?.sendTelemetryException(err, { error: message });
      });
      return sentComment;
}
