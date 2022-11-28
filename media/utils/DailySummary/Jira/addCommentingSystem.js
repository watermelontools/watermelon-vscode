import sendMessage from "../../sendVSCodeMessage.js";

const addCommentingSystem = (ticketKey) => {
    $(`.${ticketKey}`).append(
        `
      <div class="d-flex flex-items-end flex-justify-end" id="jira-comment-button-${ticketKey}">
       <button class="btn" type="button" >Comment</button>
      </div>
      `
      );
      $(`#jira-comment-button-${ticketKey}`).on("click", function (e) {
        $(`#jira-comment-button-${ticketKey}`).replaceWith(`
         <div>
         <span>Comment on ${ticketKey}</span>
          <div>
            <textarea id="jira-comment-${ticketKey}" placeholder="This input supports Markdown"></textarea>
          </div>
          <div class="d-flex flex-items-end flex-justify-end">
           <button class="btn" type="button" id="jira-send-button-${ticketKey}">Send</button>
          </div>
         </div>
         `);
          $(`#jira-send-button-${ticketKey}`).on("click", function (e) {
            sendMessage({
              command: "jiraComment",
              issueIdOrKey: ticketKey,
              text: $(`#jira-comment-${ticketKey}`).val(),
            });
          });
      });
};

export default addCommentingSystem;
