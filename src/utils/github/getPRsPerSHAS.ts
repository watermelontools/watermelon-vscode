import { ConsoleReporter } from "@vscode/test-electron";
import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function getPRsPerSHAS({
  email,
  owner,
  repo,
  shaArray,
  repoSource,
}: {
  email: string;
  owner: string;
  repo: string;
  shaArray: string;
  repoSource: string;
}) {
  let issuesItems;
  let issues;
  switch (repoSource) {
    case "github.com":
      issues = await axios
        .post(`${backendURL}/api/github/getIssuesByCommits`, {
          user: email,
          repo,
          owner,
          commitList: shaArray,
        })
        .then((res) => res.data)
        .catch((err) => {
          let reporter = analyticsReporter();
          let { message } = err;
          reporter?.sendTelemetryException(err, { error: message });
        });
      if (issues?.error) {
        return issues;
      }
      issuesItems = issues?.items;
      break;
    case "gitlab.com":
      issues = await axios
        .post(`${backendURL}/api/gitlab/getIssuesByCommits`, {
          user: email,
          owner: owner,
          project_name: repo,
          commitList: shaArray,
        })
        .then((res) => res.data)
        .catch((err) => {
          let reporter = analyticsReporter();
          let { message } = err;
          reporter?.sendTelemetryException(err, { error: message });
        });
      if (!issues?.length) {
        return issues;
      }
      // Here we are mapping the issues.items to match the github format
      issuesItems = issues.map((issue: any) => {
        return {
          created_at: issue?.created_at,
          userImage: issue?.author?.avatar_url,
          userLink: issue?.author?.web_url,
          title: issue?.title,
          url: issue?.web_url,
          body: issue?.description,
          user: {
            html_url: issue?.author?.web_url,
            avatar_url: issue?.author?.avatar_url,
            login: issue?.author?.username,
          },
          repository_url: issue?.web_url,
          state: issue?.state,
          draft: issue?.draft,
          number: issue?.iid,
          comments: issue.comments,
        };
      });
      break;
    case "bitbucket.org":
      // Bitbucket's API only accepts a single commit ID, so we have to do this
      const singleCommitHash = shaArray.split(",")[0];

      issues = await axios
        .post(`${backendURL}/api/bitbucket/getPullRequests`, {
          userEmail: email,
          repo_slug: repo, //id here, not name
          commitHash: singleCommitHash, //array vs singular, TODO
          workspace: owner,
        })
        .then((res) => res.data)
        .catch((err) => {
          let reporter = analyticsReporter();
          let { message } = err;
          reporter?.sendTelemetryException(err, { error: message });
        });

      // Here we are mapping the issues.items to match the github format
      issuesItems = issues?.values.map((issue: any) => {
        return {
          created_at: issue?.created_on,
          userImage: null,
          userLink: null,
          title: issue?.title,
          url: issue?.links?.html?.href,
          body: issue?.description?.raw,
          user: {
            html_url: null,
            avatar_url: null,
            login: null,
          },
          repository_url: null,
          state: issue?.state,
          draft: false,
          number: issue?.id,
          comments: [],
        };
      });
      break;
  }
  return issuesItems;
}
