const addActionButtons = () => {
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