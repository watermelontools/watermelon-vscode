export default async function getPRsPerSHAS({
  octokit,
  repoName,
  owner,
  shaArray,
}: {
  octokit: any;
  owner?: string;
  repoName: string;
  shaArray: string;
}) {
  let octoresp = await octokit.request(`GET /search/issues?type=Commits`, {
    org: owner,
    q: shaArray,
  });
  return octoresp.data?.items;
}
