import sendMessage from "../sendVSCodeMessage.js";

const addCommentingSystem = (issueKey) => {
  $(`.gh-issue-${issueKey}`).append(
    `
      <div class="d-flex flex-items-end flex-justify-end" id="github-comment-button-${issueKey}">
       <button class="btn" type="button" >Comment</button>
      </div>
      `
  );
  $(`#github-comment-button-${issueKey}`).on("click", function (e) {
    $(`#github-comment-button-${issueKey}`).replaceWith(`
         <div>
         <span>Comment on Issue #${issueKey}</span>
          <div>
            <textarea id="github-comment-${issueKey}" placeholder="This input supports Markdown"></textarea>
          </div>
          <div class="d-flex flex-items-end flex-justify-end">
           <button class="btn" type="button" id="github-send-button-${issueKey}">Send</button>
          </div>
         </div>
         `);
    $(`#github-send-button-${issueKey}`).on("click", function (e) {
      sendMessage({
        command: "githubComment",
        issueKey,
        text: $(`#github-comment-${issueKey}`).val(),
      });
    });
  });
};

export default addCommentingSystem;
