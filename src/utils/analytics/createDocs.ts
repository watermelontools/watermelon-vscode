import { backendURL } from "../../constants";

const axios = require("axios");

export default async function createDocs() {
  let resp = await axios.get(`${backendURL}/api/analytics/slack/slackhelp`);
  return resp;
}
