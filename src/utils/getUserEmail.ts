export default async function getUserEmail({
    octokit,
  }: {
    octokit: any;
  }) {
    let octoresp = await octokit.request('GET /user');
    return octoresp.data?.email;
  }