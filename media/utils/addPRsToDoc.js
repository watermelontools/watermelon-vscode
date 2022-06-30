import replaceIssueLinks from "./replaceIssueLinks.js";
import replaceUserTags from "./replaceUserTags.js";
import dateToHumanReadable from "./dateToHumanReadable.js";
import parseComments from "./parseComments.js";
import addActionButtons from "./addActionButtons.js";

const addPRsToDoc = (prs) => {
  
  addActionButtons();
  $("#ghHolder").append(`
  <h3>Pull Requests</h3>
  `);
  prs.forEach((pr, index) => {
    let mdComments = "";
    pr.comments.forEach((comment) => (mdComments += parseComments(comment)));

    $("#ghHolder").append(`
      <details ${!index ? "open" : ""}>
        <summary class="pr-title">
        <img class="pr-state" src="${
          pr.state === "closed"
            ? "https://raw.githubusercontent.com/primer/octicons/main/icons/git-merge-24.svg"
            : "https://raw.githubusercontent.com/primer/octicons/main/icons/git-pull-request-24.svg"
        }"
        />
        <a 
       href="${pr.url}" target="_blank" title="View this PR on github">${
      pr.title
    }
      </a>
      </summary>
        <div>
        <div class="pr-header">
          <div class="pr-owner">
            <p class="pr-poster" title="View this user on github">
              <a class="pr-author-combo" href="${
                pr.userLink
              }"><img class='pr-author-img' src="${pr.userImage}" />${
      pr.user
    }</a>
            </p>
            <p class="pr-date">
              ${dateToHumanReadable(pr.created_at)}
            </p>
          </div>
        </div>
          <div class="pr-body">
            ${
              pr?.body
                ? (
                    replaceUserTags(marked.parse(pr.body))
                  )
                : ""
            }
          </div>
          ${mdComments}
        </div>
      </details>
      `);
  });
};

export default addPRsToDoc;
