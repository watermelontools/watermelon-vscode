import dateToHumanReadable from "../../dateToHumanReadable.js";

function addGlobalIssues(globalIssues) {
  if (globalIssues.length > 0) {
    // create an array per repository
    const globalIssuesPerRepo = globalIssues.reduce((acc, issue) => {
      if (!acc[issue.repository.name]) {
        acc[issue.repository.name] = [];
      }
      acc[issue.repository.name].push(issue);
      return acc;
    }, {});
    $("#globalIssues").append(`
        <h3>Open Issues Assigned to You in All of GitHub</h3>
    `);
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
        <div class="Box">
          <div class="blankslate">
            <h3 class="blankslate-heading">No Open Issues in ANY Repo</h3>
            <p>There are no issues anywhere. Congrats!🧘</p>
          </div>
        </div>
        `);
  }
}
export default addGlobalIssues;
