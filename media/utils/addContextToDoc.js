import replaceIssueLinks from "./replaceIssueLinks.js";
import replaceUserTags from "./replaceUserTags.js";
import dateToHumanReadable from "./dateToHumanReadable.js";
import parseComments from "./parseComments.js";
import addActionButtons from "./addActionButtons.js";
const addContextToDoc = (prs, commitLink) => {


    // Add blame to doc

    // addActionButtons();
    // $("#ghHolder").append(`
    //   <h3>Commits</h3>
    //   `);
    // $("#ghHolder").append(`
    //   <table class="Box anim-fade-in">
    //     <thead class="Box-header">
    //       <tr>
    //         <th>Commit</th>
    //         <th>Author</th>
    //         <th>Message</th>
    //         <th>Date</th>
    //       </tr>
    //     </thead>
    //     <tbody class="blame-rows">
    //     </tbody>
    //   </table>
    //   `);
    // //sort array by date, newest first
    // blameArray.sort((a, b) => {
    //   return new Date(b.commitDate) - new Date(a.commitDate);
    // });
    // blameArray.forEach((blameLine, index) => {
    //   $(".blame-rows").append(`
    //     <tr ${index % 2 === 1 ? 'class="Box-row--gray"' : ""}>
    //       <td>
    //       ${
    //         commitLink
    //           ? `<a href='${commitLink}${blameLine?.hash}'>
    //             ${blameLine?.hash?.slice(0, 7)}
    //             </a>`
    //           : blameLine?.hash?.slice(0, 7)
    //       }
    //       </td>
    //       <td>${blameLine.authorName}</td>
    //       <td>${(blameLine.message)}</td>
    //       <td>${dateToHumanReadable(blameLine.commitDate)}</td>
    //     </tr>
    //     `);
    // });

    // Add PRs to Doc

    console.log("message, commitlink", prs, commitLink);
  addActionButtons();
  $("#ghHolder").append(`
  <h3>Code Context</h3>
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
