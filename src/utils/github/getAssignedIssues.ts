export default async function getAssignedIssues({
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
  let octoresp = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    assignee: username,
  });
  return octoresp.data;
}
