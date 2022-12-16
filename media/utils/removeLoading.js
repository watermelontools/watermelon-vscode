function removeLoading(errorTimeout) {
  clearTimeout(errorTimeout);
  console.log(errorTimeout)
  $("#holders p").remove();
  $("#holders button").remove();
  $("#holders").append(`
  <div id="buttonHolder"></div>
  <br/>
  <div id="commitHolder"></div>
  <br/>
  <div id="mostRelevantJiraTicketHolder"></div>
  <br/>
  <div id="slackHolder"></div>
  <br/>
  <div id="ghHolder"></div>
  <h2>Daily Summary</h2>
  <div id="jiraHolder"></div>
  <br/>
  <div id="dailySummary"></div>`);
  
}
export default removeLoading;
