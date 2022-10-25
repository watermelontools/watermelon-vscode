import addGitHubDailySummary from "./DailySummary/GitHub/addGitHubDailySummary.js";
import addJiraTicketsToDailySummary from "./DailySummary/Jira/addJiraTicketsToDailySummary.js";
import sendLinkToOpen from "./sendLinkToOpen.js";

const addDailySummary = ({ gitHubIssues, jiraTickets }) => {
  $("#dailySummary").empty();
  if (jiraTickets) {
    addJiraTicketsToDailySummary(jiraTickets);
  } else {
    $("#dailySummary").append(`<h3>Assigned Jira Tickets</h3>`);
    $("#dailySummary").append(
      `<p>Jira is a premium feature, <a href="https://www.watermelontools.com/pages/pricing">click here to buy</a></p>`
    );
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
