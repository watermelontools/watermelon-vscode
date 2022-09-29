function addGitHubIssueHolders(error = null) {
  if (error) {
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
}
export default addGitHubIssueHolders;
