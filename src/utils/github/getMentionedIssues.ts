export default async function getMentionedIssues({
  octokit,
  owner,
  repo,
  mentioned,
}: {
  octokit: any;
  owner: string;
  repo: string;
  mentioned: string;
}) {
  let octoresp = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    mentioned,
  });
  return octoresp.data;
}
