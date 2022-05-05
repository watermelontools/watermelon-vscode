import replaceIssueLinks from "./replaceIssueLinks.js";
import replaceUserTags from "./replaceUserTags.js";
import dateToHumanReadable from "./dateToHumanReadable.js";

function parseComments(comment){
    let mdComments = "";   
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
        return mdComments;
}

export default parseComments;