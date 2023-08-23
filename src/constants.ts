/* eslint-disable @typescript-eslint/naming-convention */
// external image url
export const watermelonBannerImageURL =
  "https://uploads-ssl.webflow.com/61481c822e33bdb0fc03b217/614825b4a1420225f943ffc1_IMAGOTIPO%20FINAL%201-8.png";
// our website url
export const backendURL = "https://app.watermelontools.com";
// telemetry insights key
export const TELEMETRY_INSIGHTS_KEY = "bb2eac7f-33dd-426c-92c5-4dd922b2befb";
// extension id
export const EXTENSION_ID = "WatermelonTools.watermelon-tools";
// Commands
export const WATERMELON_SHOW_COMMAND = "watermelon.show";
export const WATERMELON_PULLS_COMMAND = "watermelon.start";
export const WATERMELON_SELECT_COMMAND = "watermelon.select";
export const WATERMELON_MULTI_SELECT_COMMAND = "watermelon.multiSelect";
export const WATERMELON_LOGIN_COMMAND = "watermelon.login";
export const WATERMELON_ADD_TO_RECOMMENDED_COMMAND = "watermelon.recommend";
export const WATERMELON_OPEN_LINK_COMMAND = "watermelon.openLink";

export enum ServiceKeys {
  GITHUB = "github",
  JIRA = "jira",
  SLACK = "slack",
  CONFLUENCE = "confluence",
  LINEAR = "linear",
  NOTION = "notion",
  SUMMARY = "watermelonSummary",
}

export const ServiceDescriptions: Record<ServiceKeys, string> = {
  [ServiceKeys.GITHUB]: "GitHub PRs",
  [ServiceKeys.JIRA]: "Jira Tickets",
  [ServiceKeys.SLACK]: "Slack Messages",
  [ServiceKeys.CONFLUENCE]: "Confluence Docs",
  [ServiceKeys.LINEAR]: "Linear Tickets",
  [ServiceKeys.NOTION]: "Notion Pages",
  [ServiceKeys.SUMMARY]: "AI Summary",
};
