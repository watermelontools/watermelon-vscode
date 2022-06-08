export default async function getAllIssues({ octokit }: { octokit: any }) {
  let octoresp = await octokit.request("GET /issues", {});
  return octoresp.data;
}
