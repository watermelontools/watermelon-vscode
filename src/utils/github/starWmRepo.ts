import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function starWmRepo({ email }: { email: string }) {
  const isStarred = await axios
    .post(`${backendURL}/api/github/starWMRepo`, {
      user: email,
    })
    .then((res) => res.data)
    .catch((err) => {
      let reporter = analyticsReporter();
      let { message } = err;
      reporter?.sendTelemetryException(err, { error: message });
    });

  return isStarred.starredWM;
}
