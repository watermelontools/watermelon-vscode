import axios from "axios";
import { backendURL } from "../../constants";

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
  ).then(res => res.data);

  return assignedJiraTickets;
}