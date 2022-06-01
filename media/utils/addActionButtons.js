import sendMessage from "./sendVSCodeMessage.js";

const addActionButtons = () => {
  $("#ghHolder").append(
    `<p>Higlight a piece of code to start.</p>`
  );
  $("#ghHolder").append(
    `<p>We will fetch the commit history for you to understand the context of the code</p>
        <button class='git-blame'>View Commit History</button>
        <br/>`
  );
  $("#ghHolder").append(
    `<p>Click this button to enrich your code with relevant information from GitHub:</p>
    <button class='run-watermelon'>View Pull Requests</button><br/>`
  );
  $("#ghHolder").append(
    `<p>Click this button to get the most relevant documentation for a piece of code:</p>
    <button class='get-docs'>Get Docs</button><br/>`
  );
  $(".run-watermelon").on("click", (event) => {
    sendMessage({ command: "run" });
  });
  $(".git-blame").on("click", (event) => {
    sendMessage({ command: "blame" });
  });
  $(".git-blame").on("click", (event) => {
    sendMessage({ command: "docs" });
  });
};
export default addActionButtons;
