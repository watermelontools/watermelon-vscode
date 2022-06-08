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
    repo: `${owner}/${repoName}`,
    q: shaArray,
  });

  let filteredResults = octoresp.data?.items.filter((item: { url: string | string[]; }) => (item.url.includes(repoName)));
  return filteredResults;
}
