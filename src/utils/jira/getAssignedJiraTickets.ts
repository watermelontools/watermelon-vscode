import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../../utils/vscode/reporter";
import getTicketComments from "./getTicketComments";

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
  let ticketsWithComments: any[]=[];
  let ticketPromises = assignedJiraTickets.map(
    async (ticket: { key: string; comments: any[] }) => {
      let comments = await getTicketComments({
        email: user,
        issueIdOrKey: ticket.key,
      });
      ticketsWithComments.push({
        ...ticket,
        comments,
      });
    }
  );
  await Promise.all(ticketPromises);
  return ticketsWithComments;
}
