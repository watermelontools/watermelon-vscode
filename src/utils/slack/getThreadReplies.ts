import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function getThreadReplies({
  email,
  channelId,
  ts,
}: {
  email: string;
  channelId: string;
  ts: string;
}) {
  const conversationReplies = await axios
    .post(`${backendURL}/api/slack/getConversationReplies`, {
      user: email,
      channelId,
      ts,
    })
    .then((res) => res.data)
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });
  return conversationReplies.messages;
}
