import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function getTicketComments({
  email,
  text,
}: {
    email: string,
    text: string,
}) {
  const sentComment = await axios
    .post(`${backendURL}/api/slack/searchMessagesByText`, {
        user: email,
        text,
      })
      .then((res) => res.data)
        let reporter = analyticsReporter();
        let { message } = err;
        reporter?.sendTelemetryException(err, { error: message });
      });
      return sentComment;
}
