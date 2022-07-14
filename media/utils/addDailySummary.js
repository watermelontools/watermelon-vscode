import dateToHumanReadable from "./dateToHumanReadable.js";
import sendLinkToOpen from "./sendLinkToOpen.js";

const issueBox = (issue) => {
  return `
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
  </div>
  `;
};

const addDailySummary = (data) => {
  $("#dailySummary").empty();
  $("#dailySummary").append(`
    <div id="assignedIssues">
    </div>
    <div id="creatorIssues">
    </div>
    <div id="mentionedIssues">
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
  if (data.assignedIssues.length > 0) {
    $("#assignedIssues").append(`
    <div class="Box ">
      <div class="Box-header">
        <h3 class="Box-title">Issues Assigned to You in this Repo</h3>
      </div>
    </div>
    `);
    data.assignedIssues.map((issue) => {
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
  if (data.creatorIssues.length > 0) {
    $("#creatorIssues").append(`
      <div class="Box ">
        <div class="Box-header">
          <h3 class="Box-title">Issues Created by You in this Repo</h3>
        </div>
      </div>
      `);
    data.creatorIssues.map((issue) => {
      $("#creatorIssues .Box").append(`
        ${issueBox(issue)}
        `);
    });
  } else {
    $("#creatorIssues").append(`
    <div class="Box">
      <div class="blankslate">
        <h3 class="blankslate-heading">You have not Created Issues in this Repo</h3>
        <p>Go ahead and do so 🌵</p>
      </div>
    </div>
    `);
  }
  if (data.mentionedIssues.length > 0) {
    $("#mentionedIssues").append(`
    <div class="Box ">
      <div class="Box-header">
        <h3 class="Box-title">Issues that Mention You in this Repo</h3>
      </div>
    </div>
    `);
    data.mentionedIssues.map((issue) => {
      $("#mentionedIssues .Box").append(`
      ${issueBox(issue)}
      `);
    });
  } else {
    $("#mentionedIssues").append(`
    <div class="Box">
      <div class="blankslate">
        <h3 class="blankslate-heading">No Issues Mention You in this Repo</h3>
        <p>You have no open issues that mention you 🙊</p>
      </div>
    </div>
  `);
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
