import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function getCreatorIssues({
  email,
  owner,
  repo,
  username,
}: {
  email: string;
  owner: string;
  repo: string;
  username: string;
}) {
  const creatorIssues = await axios
    .post(`${backendURL}/api/github/getCreatorIssues`, {
      user: email,
      owner,
      repo,
      username,
    })
    .then((res) => res.data)
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });

  return creatorIssues;
}
