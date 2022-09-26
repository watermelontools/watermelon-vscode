import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../../utils/vscode/reporter";

export default async function getAssignedJiraTickets({
  userEmail,
}: {
  userEmail: string;
}) {
  const assignedJiraTickets = await axios.post(
    `${backendURL}/api/jira/getAssignedTicketsInProgress`,
    {
      userEmail,
    }
  ).then(res => res.data).catch(err => {
    let reporter = analyticsReporter();
    let { message } = err;
    reporter?.sendTelemetryException(err, { 'error': message });
  });

  return assignedJiraTickets;
}