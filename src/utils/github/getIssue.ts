export default async function getIssue({
    octokit,
    issueUrl,
  }: {
    octokit: any;
    issueUrl: string;
  }) {
   let octoresp=  await octokit.request(`GET ${issueUrl}`)
   return octoresp.data;
  }