import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function getPRsPerSHAS({
  email,
  owner,
  repo,
  shaArray,
}: {
  email: string;
  owner: string;
  repo: string;
  shaArray: string;
}) {
  const issues = await axios
    .post(`${backendURL}/api/github/getIssuesByCommits`, {
      user: email,
      repo,
      owner,
      commitList: shaArray
    })
    .then((res) => res.data)
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });
    return issues;
}
