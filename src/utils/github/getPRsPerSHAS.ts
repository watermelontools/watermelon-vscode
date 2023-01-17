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

  if (repoSource === "github.com") {
    const issues = await axios
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
  } else if (repoSource === "gitlab.com") {
    const issues = await axios
      .post(`${backendURL}/api/gitlab/getIssuesByCommits`, {
        user: 'estebanvargas94@gmail.com',
        project_id: '42201317', //project id here, not name
        // commitList: shaArray,
        commitList: '408d5ff39000b1c5cb3f2a6147b2f3afb3c41726'
      })
      .then((res) => res.data)
      .catch((err) => {
        let reporter = analyticsReporter();
        let { message } = err;
        reporter?.sendTelemetryException(err, { error: message });
      });

    // Here we are mapping the issues.items to match the github format
    issuesItems = [{
      created_at: issues[0].created_at,
      userImage: issues[0].author.avatar_url,
      userLink: issues[0].author.web_url,
      title: issues[0].title,
      url: issues[0].web_url,
      body: issues[0].description,
      user: {
        html_url: issues[0].author.web_url,
        avatar_url: issues[0].author.avatar_url,
        login: issues[0].author.username
      },
      repository_url: issues[0].web_url,
      state: issues[0].state,
      draft: issues[0].draft,
      number: issues[0].iid,
      comments: []
    }];

  } else if (repoSource === "bitbucket.org") {
    const issues = await axios
      .post(`${backendURL}/api/bitbucket/getPullRequests`, {
        userEmail: email,
        repo_slug: repo, //id here, not name
        commitHash: shaArray, //array vs singular, TODO
        workspace: owner,
      })
      .then((res) => res.data)
      .catch((err) => {
        let reporter = analyticsReporter();
        let { message } = err;
        reporter?.sendTelemetryException(err, { error: message });
      });

    // Here we are mapping the issues to match the github format
    issuesItems = {
      created_at: issues.items.created_at,
      userImage: issues.items.author.avatar_url,
      userLink: issues.items.author.web_url,
      title: issues.items.title,
      url: issues.items.web_url,
      body: issues.items.description,
      user: {
        html_url: issues.items.author.web_url,
        avatar_url: issues.items.author.avatar_url,
      },
      repository_url: issues.items.web_url,
      state: issues.items.state,
      draft: issues.items.draft,
      number: issues.items.iid,
    };
  }

  return issuesItems;
}
