import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function getAssignedIssues({
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
  const allIssues = await axios
    .post(`${backendURL}/api/github/getAssignedIssues`, {
      user: email,
    })
    .then((res) => res.data)
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });

  return allIssues;
}
