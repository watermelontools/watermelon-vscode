import { backendURL } from "../../constants";

const axios = require("axios");

export default async function explainCode({
  wrangledBlockOfCode
}: {
  wrangledBlockOfCode: string;
}) {
  let resp = await axios.post(
    `${backendURL}/api/gpt3/explainCode`,
    {
      codeBlock: wrangledBlockOfCode
    }
  );
  return resp;
}
