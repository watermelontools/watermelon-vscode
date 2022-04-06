import { backendURL } from "../constants";

const axios = require("axios");

export default async function countOrganizationQueries({
  organizationName,
}: {
  organizationName?: string;
}) {
  if (organizationName) {
    await axios.post(`${backendURL}/api/github/countUserQueries`, {
      organizationName,
    });
  }
  return true;
}
