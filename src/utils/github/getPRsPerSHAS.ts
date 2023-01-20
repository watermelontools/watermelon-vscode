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
      issuesItems = issues.items;
      break;
    case "gitlab.com":
      console.log("gitlab.com params: ", email, owner, repo, shaArray);
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

      // Here we are mapping the issues.items to match the github format
      issuesItems = [
        {
          created_at: issues[0].created_at,
          userImage: issues[0].author.avatar_url,
          userLink: issues[0].author.web_url,
          title: issues[0].title,
          url: issues[0].web_url,
          body: issues[0].description,
          user: {
            html_url: issues[0].author.web_url,
            avatar_url: issues[0].author.avatar_url,
            login: issues[0].author.username,
          },
          repository_url: issues[0].web_url,
          state: issues[0].state,
          draft: issues[0].draft,
          number: issues[0].iid,
          comments: [],
        },
      ];
      break;
    case "bitbucket.org":
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

      console.log("bitbucket issues: ", issues);
      // Here we are mapping the issues.items to match the github format
      issuesItems = [
        {
          created_at: issues.values[0]?.created_on,
          userImage: null,
          userLink: null,
          title: issues.values[0].title,
          url: issues.values[0].links.html.href,
          body: issues.values[0]?.description?.raw,
          user: {
            html_url: null,
            avatar_url: null,
            login: null,
          },
          repository_url: null,
          state: issues.values[0]?.state,
          draft: false,
          number: issues.values[0].id,
          comments: [],
        },
      ];
      break;
  }

  return issuesItems;
}
