export default async function getGitHubUserInfo({
    octokit,
  }: {
    octokit: any;
  }) {
    let octoresp = await octokit.request('GET /user');
    return octoresp?.data;
  }
