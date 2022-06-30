import replaceIssueLinks from "./replaceIssueLinks.js";
import replaceUserTags from "./replaceUserTags.js";
import dateToHumanReadable from "./dateToHumanReadable.js";

function parseComments(comment) {
  let mdComments = "";
  mdComments += `
        <div class="comment">
        <div class="comment-header">
          <h5 class="comment-author" title="View this user on github" class='pr-author-combo'>
          <a href="${comment.user.html_url}" >  
          <img src="${comment.user.avatar_url}" class='pr-author-img' style="margin: 0 0 0 0" />
            ${comment.user.login}
          </a>  on ${dateToHumanReadable(comment.created_at)}
          </h5>
        </div>
        <div class="comment-body">
      ${comment?.body ? replaceUserTags(marked.parse(comment.body)) : ""}
        </div>
        </div>`;
  return mdComments;
}

export default parseComments;
