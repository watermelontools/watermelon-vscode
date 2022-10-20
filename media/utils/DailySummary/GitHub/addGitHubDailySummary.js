import addAssignedIssues from "./addAssignedIssues.js";
import addCreatorIssues from "./addCreatorIssues.js";
import addGlobalIssues from "./addGlobalIssues.js";
import addMentionedIssues from "./addMentionedIssues.js";
import addGitHubIssueHolders from "./addGitHubIssueHolders.js";

function addGitHubDailySummary({ gitHubIssues }) {
  addGitHubIssueHolders(gitHubIssues.error);
  addGlobalIssues(gitHubIssues.globalIssues);
  addAssignedIssues(gitHubIssues.assignedIssues);
  addCreatorIssues(gitHubIssues.creatorIssues);
  addMentionedIssues(gitHubIssues.mentionedIssues);
}
export default addGitHubDailySummary;
