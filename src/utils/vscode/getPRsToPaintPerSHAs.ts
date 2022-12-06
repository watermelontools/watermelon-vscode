import getPRsPerSHAS from "../github/getPRsPerSHAS";
import getIssue from "../github/getIssue";
import getIssueComments from "../github/getIssueComments";
import { noLinesSelected, noSearchResults } from "./showErrors";

export default async function getPRsToPaintPerSHAs({
  arrayOfSHAs,
  email,
  owner,
  repo,
}: {
  arrayOfSHAs: string[];
  email: string;
  owner?: string;
  repo?: string;
}): Promise<
  | {
      user: any;
      userImage: string;
      userLink: string;
      title: string;
      comments: any[];
      created_at: any;
      body: string;
      avatar: string;
      url: string;
      repo_url: string;
      state: string;
      draft: boolean;
      number: number;
    }[]
  | { errorText: string }
> {
  // takes the first 22 shas and creates a list to send to the gh api
  let joinedArrayOfSHAs = arrayOfSHAs.slice(0, 22).join();
  if (joinedArrayOfSHAs.length < 1) {
    noLinesSelected();
    return { errorText: "No lines selected" };
  }
  let foundPRs = await getPRsPerSHAS({
    email,
    repo: repo ?? "",
    owner:owner?? "",
    shaArray: joinedArrayOfSHAs,
  });
  if (foundPRs?.length === 0) {
    noSearchResults();
    return { errorText: "No search results" };
  }

  // Fetch information
  let issuesWithTitlesAndGroupedComments: {
    user: any;
    userLink: string;
    userImage: string;
    title: string;
    comments: any[];
    created_at: any;
    body: string;
    avatar: string;
    url: string;
    repo_url: string;
    state: string;
    draft: boolean;
    number: number;
  }[] = [];

   let prPromises = foundPRs.map(async (issue: { number: number }) => {
    let comments = await getIssueComments({
      email,
      issueNumber:issue.number,
      repo: repo ?? "",
      owner:owner?? "",
    });
    let issueData = await getIssue({
      email,
      issueNumber:issue.number,
      repo: repo ?? "",
      owner:owner?? "",
    });
    if (issueData.user.type.toLowerCase() !== "bot"){
      issuesWithTitlesAndGroupedComments.push({
        created_at: issueData.created_at,
        user: issueData.user.login,
        userImage: issueData.user.avatar_url,
        userLink: issueData.user.html_url,
        title: issueData.title,
        url: issueData.html_url,
        body: issueData.body,
        avatar: issueData.user.avatar_url,
        repo_url: issueData.repository_url,
        state: issueData.state,
        draft: issueData.draft,
        number: issue.number,
        comments: comments.map((comment: any) => {
          return comment;
        }),
      });}
  });
  await Promise.all(prPromises); 
  return issuesWithTitlesAndGroupedComments;
}
