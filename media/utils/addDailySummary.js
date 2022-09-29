import addGitHubDailySummary from "./DailySummary/GitHub/addGitHubDailySummary.js";
import addJiraTicketsToDailySummary from "./addJiraTicketsToDailySummary.js";
import sendLinkToOpen from "./sendLinkToOpen.js";

const addDailySummary = ({ gitHubIssues, jiraTickets }) => {
  $("#dailySummary").empty();
  if (gitHubIssues) {
    addGitHubDailySummary({ gitHubIssues });
  }
  if (jiraTickets) {
    addJiraTicketsToDailySummary(jiraTickets);
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
