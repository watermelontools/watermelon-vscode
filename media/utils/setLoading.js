import addActionButtons from "./addActionButtons.js";

function setLoading(errorTimeout) {
  $("#ghHolder").replaceWith(`
    <div id="ghHolder">
    <p> <i class='codicon codicon-loading loader-spinner'></i>Loading</p>
    </div>
    `);
  return (errorTimeout = setTimeout(setError, 5000));
}
function setError() {
  $("#ghHolder").replaceWith(`
    <div id="ghHolder">
      <p>We might have run into an error, our team is on it.</p>
      <p>Try running a new Watermelon query, please.</p>
    </div>
    `);
  addActionButtons();
}

export default setLoading;
