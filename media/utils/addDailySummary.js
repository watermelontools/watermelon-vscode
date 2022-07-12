import dateToHumanReadable from "./dateToHumanReadable.js";
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
    // create an array per repository
    const globalIssuesPerRepo = data.globalIssues.reduce((acc, issue) => {
      if (!acc[issue.repository.name]) {
        acc[issue.repository.name] = [];
      }
      acc[issue.repository.name].push(issue);
      return acc;
    }, {});
    console.log(globalIssuesPerRepo);

    Object.keys(globalIssuesPerRepo).map((repoName) => {
      $("#globalIssues").append(`
      <div class="Box Box--condensed" id="${repoName}">
      <div class="Box-header">
        <h5 class="Box-title Truncate">
          <a href="${globalIssuesPerRepo[repoName][0].repository.owner.html_url}" class="Truncate-text">
            ${globalIssuesPerRepo[repoName][0].repository.owner.login}
          </a>
          <span> / </span>
          <a href="${globalIssuesPerRepo[repoName][0].repository.html_url}"  class="Truncate-text">
            ${globalIssuesPerRepo[repoName][0].repository.name} 
          </a>
        </h5>
      </div>

      </div>
      `);
      globalIssuesPerRepo[repoName].forEach((issue) => {
        $(`#${repoName}`).append(`
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
      `);
      });
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
