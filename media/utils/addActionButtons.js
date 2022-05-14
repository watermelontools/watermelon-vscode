import sendMessage from "./sendVSCodeMessage.js";

const addActionButtons = () => {
    $("#ghHolder").append(
        `<button class='create-docs'>Create Repo Docs</button><br/>`
      );
      $("#ghHolder").append(
        `<button class='git-blame'>View Git Blame</button>`
      );
      $("#ghHolder").append(
        "<button class='run-watermelon'>View Pull Requests (Beta)</button><br/>"
      );
    $(".run-watermelon").on("click", (event) => {
        sendMessage({ command: "run" });
      });
      $(".create-docs").on("click", (event) => {
        sendMessage({ command: "create-docs" });
      });
      $(".git-blame").on("click", (event) => {
        sendMessage({ command: "blame" });
      });
};
export default addActionButtons;