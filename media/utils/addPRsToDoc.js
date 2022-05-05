import replaceIssueLinks from "./replaceIssueLinks.js";
import replaceUserTags from "./replaceUserTags.js";
import dateToHumanReadable from "./dateToHumanReadable.js";

const addPRsToDoc = (prs, codex) => {
    $("#ghHolder").append(
      "<button class='run-watermelon'>Run Watermelon</button><br/>"
    );

    $("#ghHolder").append(
      `<button class='create-docs'>Create repo docs</button>`
    );
    $(".run-watermelon").on("click", (event) => {
      sendMessage({ command: "run" });
    });
    $(".create-docs").on("click", (event) => {
      sendMessage({ command: "create-docs" });
    });
    $("#ghHolder").append(`<p>${codex}</p>`);
    prs.forEach((pr, index) => {
      let mdComments = "";
      pr.comments.forEach((comment) => {
        mdComments += `
        <div class="comment">
        <div class="comment-header">
          <h5 class="comment-author" title="View this user on github">
            <a href="${comment.user.html_url}">${
          comment.user.login
        }</a> on ${dateToHumanReadable(comment.created_at)}
          </h5>
        </div>
        <div class="comment-body">
      ${comment?.body ? replaceUserTags(marked.parse(comment.body)) : ""}
        </div>
        </div>`;
      });
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
                ? replaceIssueLinks(
                    replaceUserTags(marked.parse(pr.body)),
                    pr.repo_url
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