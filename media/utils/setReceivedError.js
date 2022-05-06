function setReceivedError(errorText, errorTimeout) {
  clearTimeout(errorTimeout);
  $("#ghHolder").replaceWith(`
    <div id="ghHolder">
      <p>We ran into this error: ${errorText}</p>
      <p>Try running a new Watermelon query, please.</p>
    </div>
    `);
  $("#ghHolder").append(
    "<button class='run-watermelon'>Run Watermelon</button><br/>"
  );
  $(".run-watermelon").on("click", (event) => {
    sendMessage({ command: "run" });
  });
  $("#ghHolder").append(
    `<button class='create-docs' >Create repo docs</button>`
  );
  $(".create-docs").on("click", (event) => {
    sendMessage({ command: "create-docs" });
  });
}
export default setReceivedError;
