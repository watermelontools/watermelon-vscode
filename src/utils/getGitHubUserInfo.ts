import axios from "axios";
import { backendURL } from "../constants";
import analyticsReporter from "./vscode/reporter";

export default async function getGitHubUserInfo({ email }: { email: string }) {
  let octoresp = await axios
    .post(`${backendURL}/api/github/getUser`, {
      user: email,
    })
    .then((res) => res.data)
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });

  return octoresp;
}
