import { backendURL } from "../../constants";

const axios = require("axios");

export default async function searchType({
  searchType,
  owner,
  repo,
  localUser,
  userEmail
}: {
  searchType: string;
  owner?: string;
  repo?: string;
  localUser?: string;
  userEmail?: string;
}) {
  let resp = await axios.post(
    `${backendURL}/api/analytics/github/search`,
    {
      searchType,
      owner,
      repo,
      localUser,
      userEmail
    }
  );
  return resp;
}
