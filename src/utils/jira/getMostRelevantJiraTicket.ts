import axios from "axios";
import { backendURL } from "../../constants";

export default async function getMostRelevantJiraTicket({
  user,
  prTitle,
}: {
  user: string;
  prTitle: string;
}) {
  const jiraTickets = await axios
    .post(`${backendURL}/api/jira/getMostRelevantJiraTicket`, {
      user,
      prTitle,
    })
    .then((res) => res.data);
  return jiraTickets;
}
