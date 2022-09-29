import addAssignedIssues from "./addAssignedIssues.js";
import addCreatorIssues from "./addCreatorIssues.js";
import addGlobalIssues from "./addGlobalIssues.js";
import addMentionedIssues from "./addMentionedIssues.js";
import addGitHubIssueHolders from "./addGitHubIssueHolders.js";
const issueBox = (issue) => {
  return `
    <div class="Box-row Box-row--hover-gray d-flex flex-justify-between">
        <div class="Box-row-cell">
          <a href="${issue.html_url}">${issue.title}</a>
          <p class="text-small">
            By ${
              issue.user.login
            } on <span class="text-light">${dateToHumanReadable(
    issue.created_at
  )}</span>
          </p>
        </div>
        ${
          issue.comments
            ? `
            <div class="Box-row-cell d-flex flex-justify-center flex-items-center">
              <div class="icon-holder">
                <i class="codicon codicon-comment"></i>
              </div>
              <span>${issue.comments}</span>
            </div>
          `
            : ""
        }
      </div>
    </div>
    `;
};
function addGitHubDailySummary(data) {
  addGitHubIssueHolders(data.error);
  addGlobalIssues(data.globalIssues);
  addAssignedIssues(data.assignedIssues);
  addCreatorIssues(data.creatorIssues);
  addMentionedIssues(data.mentionedIssues);
}
export default addGitHubDailySummary;
