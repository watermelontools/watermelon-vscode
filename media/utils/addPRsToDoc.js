import sendMessage from "./sendVSCodeMessage.js";
import replaceUserTags from "./replaceUserTags.js";
import dateToHumanReadable from "./dateToHumanReadable.js";
import parseComments from "./parseComments.js";

const paintPRs = (prs) => {
  prs.forEach((pr, index) => {
    let mdComments = "";
    if (pr.comments > 0) {
      pr.comments?.forEach((comment) => (mdComments += parseComments(comment)));
    }
    $("#ghHolder").append(`
    <div class="anim-fade-in">
      <details ${!index ? "open" : ""}>
        <summary class="pr-title">
          <div>
            <div class="details-state">
              <div class="icon-holder">
                <i class='codicon codicon-chevron-right'></i>
                <i class='codicon codicon-chevron-down'></i>
              </div>
              <a 
              href="${pr.url}" target="_blank" title="View this PR on github">${
      pr.title
    }</a>
            </div>
          </div>
          <div class="icon-holder">${
            pr.draft
              ? "<i class='codicon codicon-git-pull-request-draft'></i>"
              : pr.state === "closed"
              ? "<i class='codicon codicon-git-merge'></i>"
              : "<i class='codicon codicon-git-pull-request'></i>"
          }
          </div>
      </summary>
        <div class="Box">
        <div class="Box-header d-flex">
            <p class="pr-poster" title="View this user on github">
              <a class="pr-author-combo" href="${
                pr.userLink
              }"><img class='pr-author-img' src="${pr.userImage}" />${
      pr.user
    } </a>
            </p>
            <p class="pr-date">
                on ${dateToHumanReadable(pr.created_at)}
            </p>
        </div>
          <div class="Box-body">
            ${
              pr?.body
                ? replaceUserTags(
                    marked.parse(pr.body, { gfm: true, breaks: true })
                  )
                : ""
            }
          </div>
          ${mdComments}
        </div>
      </details>
    </div>
      `);
  });
};
const addViewAllPRsButton = (allPRs) => {
  $("#ghHolder").append(`
    <div class="anim-fade-in">
      <button class="btn btn-primary btn-sm" id="viewAllPRs">View More Pull Requests</button>
    </div>
  `);
  $("#viewAllPRs").on("click", (event) => {
    paintPRs(allPRs);
    $("#viewAllPRs").remove();
  });
};

const addPRsToDoc = (allPRs) => {
  $("#ghHolder").append(`
  <h3>Pull Requests</h3>
  `);
  if (allPRs.error) {
    $("#ghHolder").append(`
    <p>You are not logged in to GitHub</p>
    <button class="login-watermelon btn" type="button">Get Code Context</button>
    `);

    $(".login-watermelon").on("click", (event) => {
      sendMessage({ command: "login" });
    });
    return;
  }
  let firstPR = allPRs.shift();
  paintPRs([firstPR]);
  if (allPRs.length > 0) {
    addViewAllPRsButton(allPRs);
  }
};

export default addPRsToDoc;
