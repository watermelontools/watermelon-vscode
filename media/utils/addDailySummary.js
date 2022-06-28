const addDailySummary = (data) => {
  $("#dailySummary").empty();
  $("#dailySummary").append(`
    <div id="assignedIssues">
    <h3>Issues Assigned to You in this Repo</h3>
    </div>
    <div id="creatorIssues">
    <h3>Issues You Created in this Repo</h3>
    </div>
    <div id="mentionedIssues">
    <h3>Issues that Mentioned You in this Repo</h3>
    </div>
      <div id="globalIssues">
      <h3>Open Issues Assigned to You in All of GitHub</h3>
      </div>
    `);
  if (data.globalIssues.length > 0) {
    data.globalIssues.map((issue) => {
      $("#globalIssues").append(`
      <div>
      <a href="${issue.html_url}">${issue.title}</a>
      </div>
      `);
    });
  } else {
    $("#globalIssues").append(`
    <div>
    <p>You have no open issues assigned to you</p>
    </div>
    `);
  }
  if (data.assignedIssues.length > 0) {
    data.assignedIssues.map((issue) => {
      $("#assignedIssues").append(`
<div>
<a href="${issue.html_url}">${issue.title}</a>
</div>
`);
    });
  } else {
    $("#assignedIssues").append(`
<div>
<p>You have no open issues assigned to you 🧘</p>
</div>
`);
  }
  if (data.creatorIssues.length > 0) {
    data.creatorIssues.map((issue) => {
      $("#creatorIssues").append(`
<div>
<a href="${issue.html_url}">${issue.title}</a>
</div>
`);
    });
  } else {
    $("#creatorIssues").append(`
<div>
<p>You have no open issues created 🌵</p>
</div>
`);
  }
  if (data.mentionedIssues.length > 0) {
    data.mentionedIssues.map((issue) => {
      $("#mentionedIssues").append(`
<div>
<a href="${issue.html_url}">${issue.title}</a>
</div>
`);
    });
  } else {
    $("#mentionedIssues").append(`
<div>
<p>You have no open issues that mention you 🙊</p>
</div>
`);
  }
};
export default addDailySummary;
