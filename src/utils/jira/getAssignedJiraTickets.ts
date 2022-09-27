import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../../utils/vscode/reporter";

export default async function getAssignedJiraTickets({
  user,
}: {
  user: string;
}) {
  const assignedJiraTickets = await axios
    .post(`${backendURL}/api/jira/getAssignedTicketsInProgress`, {
      user,
    })
    .then((res) => res.data)
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });

  return assignedJiraTickets;
}
