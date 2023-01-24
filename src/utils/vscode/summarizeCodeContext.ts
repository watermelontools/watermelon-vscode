import axios from "axios";
import { backendURL } from "../../constants";
import analyticsReporter from "../vscode/reporter";

export default async function summarizeCodeContext({
    pr_title,
    pr_body,
    block_of_code,
  }: {
    pr_title: string;
    pr_body: string;
    block_of_code: string;
  }) {
    const codeContextSummary = await axios
    .post(`${backendURL}/api/openai/summarizeCodeContext`, {
    pr_title,
      pr_body,
      block_of_code,
    })
    .then((res) => res.data)
    .catch((err) => {
        let reporter = analyticsReporter();
        let { message } = err;
        reporter?.sendTelemetryException(err, { error: message });
    });
    return codeContextSummary;
}