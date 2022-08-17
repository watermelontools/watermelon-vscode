import sendMessage from "./sendVSCodeMessage.js";

const addActionButtons = () => {
  let sidebarOpeningCount = 3;
  let ctoData = `<p></p>`;
  if (sidebarOpeningCount % 3 === 0) {
    ctoData = `<p>Wanna give us feedback? <a href="https://cal.pv.dev/esteban-dalel-watermelon-tools/half-hour-chat">Talk to the CTO</a></p>`;
  }
  $('#ghHolder').append(ctoData);
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
};
export default addActionButtons;
