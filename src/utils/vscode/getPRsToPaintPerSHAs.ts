import countOrganizationQueries from "../countOrganizationQueries";
import getPRsPerSHAS from "../getPRsPerSHAS";
import getIssue from "../github/getIssue";
import getIssueComments from "../github/getIssueComments";
import getRepoInfo from "./getRepoInfo";
import { noLinesSelected, noSearchResults } from "./showErrors";

export default async function getPRsToPaintPerSHAs({
  arrayOfSHAs,
  octokit,
  owner,
  repo,
}: {
  arrayOfSHAs: string[];
  octokit: any;
  owner?: string;
  repo?: string;
}) {
  let { repoName } = await getRepoInfo();

  // takes the first 22 shas and creates a list to send to the gh api
  let joinedArrayOfSHAs = arrayOfSHAs.slice(0, 22).join();
  if (joinedArrayOfSHAs.length < 1) {
    return noLinesSelected();
  }

  let foundPRs = await getPRsPerSHAS({
    octokit,
    repoName,
    owner,
    shaArray: joinedArrayOfSHAs,
  });
  if (foundPRs?.length === 0) {
    return noSearchResults();
  }

  // Increase organizational query counter value
  countOrganizationQueries({ organizationName: owner });

  // Fetch information
  let issuesWithTitlesAndGroupedComments: {
    user: any;
    userLink: string;
    title: string;
    comments: any[];
    created_at: any;
    body: string;
    avatar: string;
    url: string;
    repo_url: string
  }[] = [];

  let prPromises = foundPRs.map(async (issue: { url: any }) => {
    let comments = await getIssueComments({
      octokit,
      issueUrl: issue.url,
    });
    let issueData = await getIssue({ octokit, issueUrl: issue.url });
    if (issueData.user.type.toLowerCase() !== "bot")
      issuesWithTitlesAndGroupedComments.push({
        created_at: issueData.created_at,
        user: issueData.user.login,
        userLink: issueData.user.html_url,
        title: issueData.title,
        url: issueData.html_url,
        body: issueData.body,
        avatar: issueData.user.avatar_url,
        repo_url: issueData.repository_url,
        comments: comments.map((comment: any) => {
          return comment;
        }),
      });
  });
  await Promise.all(prPromises);
  return issuesWithTitlesAndGroupedComments;
}
