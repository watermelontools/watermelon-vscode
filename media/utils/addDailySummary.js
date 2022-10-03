import addGitHubDailySummary from "./DailySummary/GitHub/addGitHubDailySummary.js";
import addJiraTicketsToDailySummary from "./DailySummary/Jira/addJiraTicketsToDailySummary.js";
import sendLinkToOpen from "./sendLinkToOpen.js";

const addDailySummary = ({ gitHubIssues, jiraTickets }) => {
  $("#dailySummary").empty();
  if (jiraTickets) {
    addJiraTicketsToDailySummary(jiraTickets);
  }
  if (gitHubIssues) {
    addGitHubDailySummary({ gitHubIssues });
  }

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
