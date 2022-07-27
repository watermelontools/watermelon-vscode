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
  // $("#ghHolder").replaceWith(`
  //   <div id="ghHolder">
  //     <p>We might have run into an error, our team is on it.</p>
  //     <p>Try running a new Watermelon query, please.</p>
  //   </div>
  //   `);
  // addActionButtons();
  // $("#ghHolder").append(
  //   "<p>Alternatively, you can <a href='https://github.com/watermelontools/wm-extension#commands'>run with our watermelon.start command</a></p>"
  // );
  // $("#ghHolder").append(
  //   "<p>Select a piece of code to start. Then run the Watermelon VS Code Command by pressing <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>P</kbd> (or <kbd>CMD</kbd> + <kbd>SHIFT</kbd> + <kbd>P</kbd> in Mac) and type > <code>start watermelon</code></p>"
  // );
}

export default setLoading;
