import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function getTicketComments({
  email,
  issueIdOrKey,
}: {
  email: string;
  issueIdOrKey: string;
}) {
  const ticketComments = await axios
    .post(`${backendURL}/api/jira/getTicketComments`, {
        user: email,
        issueIdOrKey
      })
      .then((res) => res.data)
      .catch((err) => {
        let reporter = analyticsReporter();
        let { message } = err;
        reporter?.sendTelemetryException(err, { error: message });
      });
      return ticketComments.comments;
}
