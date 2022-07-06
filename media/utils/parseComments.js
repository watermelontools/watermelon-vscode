import replaceIssueLinks from "./replaceIssueLinks.js";
import replaceUserTags from "./replaceUserTags.js";
import dateToHumanReadable from "./dateToHumanReadable.js";

function parseComments(comment) {
  let mdComments = "";
  mdComments += `
        <div class="Box">
        <div class="Box-header">
          <h5 class="comment-author" title="View this user on github" class='pr-author-combo'>
          <a href="${comment.user.html_url}" >  
          <img src="${comment.user.avatar_url}" class='pr-author-img'/>
            ${comment.user.login}
          </a>  <span class="pr-date"> on ${dateToHumanReadable(comment.created_at)}</span>
          </h5>
        </div>
        <div class="Box-body markdown-body">
      ${comment?.body ? replaceUserTags(marked.parse(comment.body, { gfm: true, breaks: true })) : ""}
        </div>
        </div>`;
  return mdComments;
}

export default parseComments;
