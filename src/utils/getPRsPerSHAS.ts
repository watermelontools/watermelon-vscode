export default async function getPRsPerSHAS({
  octokit,
  repo,
  owner,
  shaArray,
}: {
  octokit: any;
  owner?: string;
  repo: string;
  shaArray: string;
}) {
  let octoresp = await octokit.request(`GET /search/issues?type=Commits`, {
    repo: `${owner}/${repo}`,
    q: shaArray,
  });

  let filteredResults = octoresp.data?.items.filter((item: { url: string | string[]; }) => (item.url.includes(repo)));
  return filteredResults;
}
