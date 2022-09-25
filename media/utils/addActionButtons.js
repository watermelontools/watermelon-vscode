import sendMessage from "./sendVSCodeMessage.js";

const addActionButtons = () => {
  $("#ghHolder").prepend(`<p>Higlight a piece of code to start.</p>`);
  $("#ghHolder").prepend(
    `
    <div class="anim-fade-in">
    <div class="action-buttons">
      <p>Click this button to enrich your code with relevant information from GitHub:</p>
      <button class="run-watermelon btn btn-primary" type="button">Get Code Context</button>
    </div>
    </div>
    `
  );

  $(".run-watermelon").on("click", (event) => {
    sendMessage({ command: "run" });
  });
};
export default addActionButtons;
