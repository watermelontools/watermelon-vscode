import sendMessage from "./sendVSCodeMessage.js";

function setReceivedError(errorText, errorTimeout) {
  clearTimeout(errorTimeout);
  $("#ghHolder").replaceWith(`
    <div id="ghHolder">
      <p>We ran into this error: ${errorText}</p>
      <p>Try running a new Watermelon query, please.</p>
    </div>
    `);
  $("#ghHolder").append(
    `<button class='create-docs' >Create Repo Docs</button><br/>`
  );
  $(".create-docs").on("click", (event) => {
    sendMessage({ command: "create-docs" });
  });
  $("#ghHolder").append(
    "<button class='run-watermelon'>View Pull Requests (Beta)</button><br/>"
  );
  $(".run-watermelon").on("click", (event) => {
    sendMessage({ command: "run" });
  });
}
export default setReceivedError;
