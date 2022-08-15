import sendMessage from "./sendVSCodeMessage.js";

const addActionButtons = () => {
  $("#ghHolder").append(`<p>Higlight a piece of code to start.</p>`);
  $("#ghHolder").append(
    `
    <div class="anim-fade-in">
      <p>Click this button to enrich your code with relevant information from GitHub:</p>
      <button class="run-watermelon btn btn-primary" type="button">Get Code Context</button>
    </div>
    `
  );

  $(".run-watermelon").on("click", (event) => {
    sendMessage({ command: "run" });
  });
  $(".git-blame").on("click", (event) => {
    sendMessage({ command: "blame" });
  });
};
export default addActionButtons;
