export default async function getCreatorIssues({
  octokit,
  owner,
  repo,
  creator,
}: {
  octokit: any;
  owner: string;
  repo: string;
  creator: string;
}) {
  let octoresp = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    creator,
  });
  return octoresp.data;
}
