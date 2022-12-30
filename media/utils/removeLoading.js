function removeLoading(errorTimeout) {
  clearTimeout(errorTimeout);
  console.log(errorTimeout);
  $("#holders p").remove();
  $("#holders button").remove();
  $("#holders").append(`
  <div id="buttonHolder"></div>
  <div id="commitHolder"></div>
  <div id="mostRelevantJiraTicketHolder"></div>
  <div id="slackHolder"></div>
  <div id="ghHolder"></div>
  <div id="jiraHolder"></div>
  `);
}
export default removeLoading;
