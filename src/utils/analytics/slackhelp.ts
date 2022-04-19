import { backendURL } from "../../constants";

const axios = require("axios");

export default async function slackhelp() {
  let resp = await axios.get(`${backendURL}/api/analytics/slack/slackhelp`);
  return resp;
}
