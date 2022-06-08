import addActionButtons from "./addActionButtons.js";

function setReceivedError(errorText, errorTimeout) {
  clearTimeout(errorTimeout);
  $("#ghHolder").replaceWith(`
    <div id="ghHolder">
      <p>We ran into this error: ${errorText}</p>
      <p>Try running a new Watermelon query, please.</p>
    </div>
    `);
  addActionButtons();
}
export default setReceivedError;
