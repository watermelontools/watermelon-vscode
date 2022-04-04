import { backendURL } from "../constants";

const axios = require("axios");

export default async function getIsWithinPlan({
  organizationName,
}: {
  organizationName?: string;
}) {
  if (organizationName) {
    let response = await axios.post(
      `${backendURL}/api/github/getIsWithinPlan`,
      {
        organizationName,
      }
    );
    if (response.data.organizationIsWithinPlan === "true") {
      return true;
    }
  }
  return false;
}
