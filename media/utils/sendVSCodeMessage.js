
function sendMessage(message) {
    window.vscodeApi.postMessage(message);
  }
  export default sendMessage;