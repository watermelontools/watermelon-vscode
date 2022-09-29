import addAssignedIssues from "./DailySummary/GitHub/addAssignedIssues.js";
import addCreatorIssues from "./DailySummary/GitHub/addCreatorIssues.js";
import addGlobalIssues from "./DailySummary/GitHub/addGlobalIssues.js";
import addMentionedIssues from "./DailySummary/GitHub/addMentionedIssues.js";
import dateToHumanReadable from "./dateToHumanReadable.js";
import sendLinkToOpen from "./sendLinkToOpen.js";
import sendMessage from "./sendVSCodeMessage.js";

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

const addDailySummary = (data) => {
  if (!data) {
    return;
  }
  $("#dailySummary").empty();
  if (data.error) {
    $("#dailySummary").append(`
    <p>You are not logged in to GitHub</p>
    <button class="login-watermelon btn" type="button">Login to GitHub</button>
    `);
    $(".login-watermelon").on("click", (event) => {
      sendMessage({ command: "login" });
    });
    return;
  }
  $("#dailySummary").append(`
    <div id="assignedIssues">
    </div>
    <div id="creatorIssues">
    </div>
    <div id="mentionedIssues">
    </div>
    <div id="globalIssues">
    </div>
    `);
  addGlobalIssues(data.globalIssues);
  addAssignedIssues(data.assignedIssues);
  addCreatorIssues(data.creatorIssues);
  addMentionedIssues(data.mentionedIssues);
  $("#dailySummary")
    .find("a")
    .each(function (element) {
      $(this).on("click", function (e) {
        e.preventDefault();
        let link = $(this).attr("href");
        sendLinkToOpen({ link, source: "dailySummary" });
      });
    });
};
export default addDailySummary;
