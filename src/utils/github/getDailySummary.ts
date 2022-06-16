import getAllIssues from "./getAllIssues";
import getAssignedIssues from "./getAssignedIssues";
import getCreatorIssues from "./getCreatorIssues";
import getMentionedIssues from "./getMentionedIssues";

export default async function getDailySummary({
  octokit,
  owner,
  repo,
  username,
}: {
  octokit: any;
  owner: string;
  repo: string;
  username: string;
}) {
  let globalIssues = await getAllIssues({ octokit });
  let assignedIssues = await getAssignedIssues({
    octokit,
    owner,
    repo,
    username: username || "",
  });
  let creatorIssues = await getCreatorIssues({
    octokit,
    owner,
    repo,
    creator: username || "",
  });
  let mentionedIssues = await getMentionedIssues({
    octokit,
    owner,
    repo,
    mentioned: username || "",
  });
  return {
    globalIssues,
    assignedIssues,
    creatorIssues,
    mentionedIssues,
  };
}
