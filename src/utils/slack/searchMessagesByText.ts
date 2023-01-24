import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";
import getThreadReplies from "./getThreadReplies";

export default async function searchMessagesByText({
  email,
  text,
}: {
  email: string;
  text: string;
}) {
  const foundMessages = await axios
    .post(`${backendURL}/api/slack/searchMessagesByText`, {
      user: email,
      text,
    })
    .then((res) => res.data)
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });
  let threadWithReplies: any[] = [];
  if (!foundMessages?.messages?.matches) {
    return [];
  }
  let ticketPromises = foundMessages?.messages?.matches.map(
    async (reply: { ts: string; channel: { id: string } }) => {
      let replies = await getThreadReplies({
        email,
        ts: reply.ts,
        channelId: reply.channel.id,
      });
      threadWithReplies.push({
        ...reply,
        replies,
      });
    }
  );
  await Promise.all(ticketPromises);
  return threadWithReplies;
}
