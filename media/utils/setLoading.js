import addActionButtons from "./addActionButtons.js";

function setLoading(errorTimeout) {
  $("#ghHolder").replaceWith(`
    <div id="ghHolder">
    <p> <i class='codicon codicon-loading loader-spinner'></i>Loading</p>
    </div>
    `);
  return (errorTimeout = setTimeout(setError, 5000));
}
function setError() {}

export default setLoading;
