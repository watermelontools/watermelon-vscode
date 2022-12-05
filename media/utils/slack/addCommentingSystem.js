import sendMessage from "../sendVSCodeMessage.js";

const addCommentingSystem = (threadNumber,threadTS, channelId) => {
    $(`.${threadNumber}`).append(
        `
      <div class="d-flex flex-items-end flex-justify-end" id="slack-comment-button-${threadNumber}">
       <button class="btn" type="button" >Comment</button>
      </div>
      `
      );
      $(`#slack-comment-button-${threadNumber}`).on("click", function (e) {
        $(`#slack-comment-button-${threadNumber}`).replaceWith(`
         <div>
         <span>Comment on this thread</span>
          <div>
            <textarea id="slack-comment-${threadNumber}" placeholder="This input supports Markdown"></textarea>
          </div>
          <div class="d-flex flex-items-end flex-justify-end">
           <button class="btn" type="button" id="slack-send-button-${threadNumber}">Send</button>
          </div>
         </div>
         `);
          $(`#slack-send-button-${threadNumber}`).on("click", function (e) {
            sendMessage({
              command: "slackComment",
              channelId,
              threadTS: threadTS,
              text: $(`#slack-comment-${threadNumber}`).val(),
            });
          });
      });
};

export default addCommentingSystem;
