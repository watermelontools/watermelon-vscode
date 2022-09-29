import addGitHubDailySummary from "./DailySummary/GitHub/addGitHubDailySummary.js";
import sendLinkToOpen from "./sendLinkToOpen.js";

const addDailySummary = (data) => {
  if (!data) {
    return;
  }
  $("#dailySummary").empty();
  addGitHubDailySummary(data);
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
