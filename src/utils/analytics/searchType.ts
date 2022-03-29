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
    "http://localhost:3001/api/analytics/github/search",
    {
      searchType,
      owner,
      repo,
    }
  );
  return resp;
}
