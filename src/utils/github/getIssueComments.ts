export default async function getIssueComments({
    octokit,
    issueUrl,
  }: {
    octokit: any;
    issueUrl: string;
  }) {
   let octoresp=  await octokit.request(`GET ${issueUrl}/comments`)
   return octoresp.data;
  }