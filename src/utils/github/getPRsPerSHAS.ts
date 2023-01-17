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
    console.log("gitlab.com email: ", email);
    console.log("sha array: ", shaArray);
    const issues = await axios
      .post (`${backendURL}/api/gitlab/getIssuesByCommits`, {
        user: email, 
        repo, //project id here, not name
        commitList: shaArray
      })
      .then((res) => res.data)
      .catch((err) => {
        let reporter = analyticsReporter();
        let { message } = err;
        reporter?.sendTelemetryException(err, { error: message });
      });

      // Here we are mapping the issues.items to match the github format
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

  } else if (repoSource === "bitbucket.org") {
    console.log("bitbucket.org: ", repo, shaArray);
    const issues = await axios
      .post (`${backendURL}/api/bitbucket/getPullRequests`, {
        userEmail: email, 
        repo_slug: repo, //id here, not name
        commitHash: shaArray, //array vs singular, TODO
        workspace: owner
      })
      .then((res) => res.data)
      .catch((err) => {
        let reporter = analyticsReporter();
        let { message } = err;
        reporter?.sendTelemetryException(err, { error: message });
      });
      console.log("issues.items bitbucket: ", issues.items);
      issuesItems = issues.items;
  }
  
  return issuesItems;
}
