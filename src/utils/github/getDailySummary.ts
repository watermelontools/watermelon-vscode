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
  let assignedIssues = await getAssignedIssues({
    owner,
    repo,
    username: username || "",
    email,
  });
  let creatorIssues = await getCreatorIssues({
    owner,
    repo,
    username: username || "",
    email,
  });
  let mentionedIssues = await getMentionedIssues({
    owner,
    repo,
    username: username || "",
    email,
  });
  return {
    globalIssues,
    assignedIssues,
    creatorIssues,
    mentionedIssues,
  };
}
