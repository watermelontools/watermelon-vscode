function addAssignedIssues(assignedIssues) {
  if (assignedIssues.length > 0) {
    $("#assignedIssues").append(`
        <div class="Box ">
          <div class="Box-header">
            <h3 class="Box-title">Issues Assigned to You in this Repo</h3>
          </div>
        </div>
        `);
    assignedIssues.map((issue) => {
      $("#assignedIssues .Box").append(`
          ${issueBox(issue)}
          `);
    });
  } else {
    $("#assignedIssues").append(`
        <div class="Box">
          <div class="blankslate">
            <h3 class="blankslate-heading">No Issues Assigned to You in this Repo</h3>
            <p>You have no open issues that mention you 🙊</p>
          </div>
        </div>
        `);
  }
}
export default addAssignedIssues;
