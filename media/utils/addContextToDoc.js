import replaceIssueLinks from "./replaceIssueLinks.js";
import replaceUserTags from "./replaceUserTags.js";
import dateToHumanReadable from "./dateToHumanReadable.js";
import parseComments from "./parseComments.js";
import addActionButtons from "./addActionButtons.js";
const addContextToDoc = (prs, commitLink) => {
  console.log("message, commitlink", prs, commitLink);
  
  addActionButtons();
  $("#ghHolder").append(`
  <h3>Code Context</h3>
  `);

    // Latest commit message
    $("#ghHolder").append(`
    <table class="Box anim-fade-in">
      <thead class="Box-header">
        <tr>
          <th>Commit</th>
          <th>Author</th>
          <th>Message</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody class="blame-rows">
      </tbody>
    </table>
    `);

    // Most Relevant PR
    $("#ghHolder").append(`
    <div class="anim-fade-in">

        <summary class="pr-title">
          <div>
            <div class="details-state">
              <div class="icon-holder">
                <i class='codicon codicon-chevron-right'></i>
                <i class='codicon codicon-chevron-down'></i>
              </div>
              <a 
              href="${prs[0].url}" target="_blank" title="View this PR on github">${
              prs[0].title
              }</a>
            </div>
          </div>
          <div class="icon-holder">${
            prs[0].state === "closed"
            ? "<i class='codicon codicon-git-merge'></i>"
              : "<i class='codicon codicon-git-pull-request'></i>"
          }
          </div>
      </summary>
        <div class="Box">
        <div class="Box-header d-flex">
            <p class="pr-poster" title="View this user on github">
              <a class="pr-author-combo" href="${
                prs[0].userLink
              }"><img class='pr-author-img' src="${prs[0].userImage}" />${
               prs[0].user
              } </a>
            </p>
            <p class="pr-date">
                on ${dateToHumanReadable(prs[0].created_at)}
            </p>
        </div>
          <div class="Box-body">
            ${
              prs[0]?.body
                ? (
                    replaceUserTags(marked.parse(prs[0].body, { gfm: true, breaks: true }))
                  )
                : ""
            }
          </div>
          ${(prs[0].comments)}
        </div>
      </details>
    </div>
      `);
};

export default addContextToDoc;
