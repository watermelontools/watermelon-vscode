import axios from "axios";
import { backendURL } from "../../constants";

export default async function getMostRelevantJiraTicket({
  userEmail,
  prTitle,
}: {
  userEmail: string;
  prTitle: string;
}) {
  const jiraTickets = await axios.post(
    `${backendURL}/api/jira/getMostRelevantJiraTicket`,
    {
      userEmail,
      prTitle,
    }
  ).then(res => res.data);

  return jiraTickets[0];
}
