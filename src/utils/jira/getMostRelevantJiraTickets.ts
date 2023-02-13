import axios from "axios";
import { backendURL } from "../../constants";
import getTicketComments from "./getTicketComments";

export default async function getMostRelevantJiraTickets({
  user,
  prTitle,
}: {
  user: string;
  prTitle: string;
}): Promise<any> {
  const jiraTickets = await axios
    .post(`${backendURL}/api/jira/getMostRelevantJiraTicket`, {
      user,
      prTitle,
    })
    .then((res) => res.data);
  if (jiraTickets?.error === "no access_token") {
    return { errorText: "Not logged in" };
  }
  return jiraTickets;
}
