import getAllIssues from "./getAllIssues";
import getAssignedIssues from "./getAssignedIssues";
import getCreatorIssues from "./getCreatorIssues";
import getMentionedIssues from "./getMentionedIssues";

export default async function getGitHubDailySummary({
  owner,
  repo,
  username,
  email,
}: {
  owner: string;
  repo: string;
  username: string;
  email: string;
}) {
  let globalIssues = await getAllIssues({ email });
  const userObject = {
    owner,
    repo,
    username: username || "",
    email,
  };
  let assignedIssues = await getAssignedIssues(userObject);
  let creatorIssues = await getCreatorIssues(userObject);
  let mentionedIssues = await getMentionedIssues(userObject);
  return {
    globalIssues,
    assignedIssues,
    creatorIssues,
    mentionedIssues,
  };
}
