import { backendURL } from "../../constants";

const axios = require("axios");

export default async function searchType({
  searchType,
  owner,
  repo,
}: {
  searchType: string;
  owner?: string;
  repo?: string;
}) {
  let resp = await axios.post(
    `${backendURL}/api/analytics/github/search`,
    {
      searchType,
      owner,
      repo,
    }
  );
  return resp;
}
