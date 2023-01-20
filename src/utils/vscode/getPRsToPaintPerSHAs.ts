import getPRsPerSHAS from "../github/getPRsPerSHAS";
import getIssue from "../github/getIssue";
import getIssueComments from "../github/getIssueComments";
import { noLinesSelected, noSearchResults } from "./showErrors";

export default async function getPRsToPaintPerSHAs({
  arrayOfSHAs,
  email,
  owner,
  repo,
  repoSource
}: {
  arrayOfSHAs: string[];
  email: string;
  owner?: string;
  repo?: string;
  repoSource: string;
}): Promise<
  | {
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      user: any;
      userImage: string;
      userLink: string;
      title: string;
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      comments: any[];
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
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
    owner: owner ?? "",
    shaArray: joinedArrayOfSHAs,
    repoSource
  });
  if (foundPRs?.length === 0) {
    noSearchResults();
    return { errorText: "No search results" };
  }

  // Fetch information
  let issuesWithTitlesAndGroupedComments: {
    user: string;
    userLink: string;
    userImage: string;
    title: string;
    comments: string[];
    created_at: string;
    body: string;
    avatar: string;
    url: string;
    repo_url: string;
    state: string;
    draft: boolean;
    number: number;
  }[] = [];

  if (foundPRs) {
    let prPromises = foundPRs.map(async (issue: { number: number }) => {
      let comments = await getIssueComments({
        email,
        issueNumber: issue.number,
        repo: repo ?? "",
        owner: owner ?? "",
      });
      let issueData = await getIssue({
        email,
        issueNumber: issue.number,
        repo: repo ?? "",
        owner: owner ?? "",
      });
      // TODO: Filter GitLab and Bitbucket bots
      if (((repoSource === "github.com" ) && (issueData.user.type.toLowerCase() !== "bot"))) {
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
          number: issue.number || issueData.number,
          comments: [],
          /*
          comments: comments.map((comment: string) => {
            return comment;
          }),
          */
        });
      } else if (repoSource === "gitlab.com") {
        issuesWithTitlesAndGroupedComments.push({
          created_at: foundPRs[0].created_at,
          user: foundPRs[0].user.login,
          userImage: foundPRs[0].user.avatar_url,
          userLink: foundPRs[0].user.html_url,
          title: foundPRs[0].title,
          url: foundPRs[0].html_url,
          body: foundPRs[0].body,
          avatar: foundPRs[0].user.avatar_url,
          repo_url: foundPRs[0].repository_url,
          state: foundPRs[0].state,
          draft: foundPRs[0].draft,
          number: issue.number || foundPRs[0].number,
          comments: [],
        })
      } else if (repoSource === "bitbucket.org") {
        issuesWithTitlesAndGroupedComments.push({
          created_at: foundPRs[0].created_at,
          user: foundPRs[0].user.login,
          userImage: foundPRs[0].user.avatar_url,
          userLink: foundPRs[0].user.html_url,
          title: foundPRs[0].title,
          url: foundPRs[0].html_url,
          body: foundPRs[0].body,
          avatar: foundPRs[0].user.avatar_url,
          repo_url: foundPRs[0].repository_url,
          state: foundPRs[0].state,
          draft: foundPRs[0].draft,
          number: issue.number || foundPRs[0].number,
          comments: [],
        })
      }
    });
    await Promise.all(prPromises);
  } else {
    return { errorText: "No search results" };
  }

  return issuesWithTitlesAndGroupedComments;
}
