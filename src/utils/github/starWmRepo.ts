export default async function starWmRepo({ octokit }: { octokit: any }) {
  let octoresp = await octokit.rest.activity.starRepoForAuthenticatedUser(
    {
      owner: 'watermelontools',
      repo: 'wm-extension'
    });
  return octoresp.data;
}
