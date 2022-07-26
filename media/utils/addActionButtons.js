import sendMessage from "./sendVSCodeMessage.js";

const addActionButtons = () => {
  $("#ghHolder").append(`<p>Higlight a piece of code to start.</p>`);
  $("#ghHolder").append(
    `
    <div class="anim-fade-in">
      <br/>
      <button class="git-blame btn btn-primary" type="button">View Commit History</button>
      <br/>
    </div>
        `
  );
  $("#ghHolder").append(
    `
    <div class="anim-fade-in">
      <br/>
      <button class="run-watermelon btn btn-primary" type="button">View Pull Requests</button>
      <br/>
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
