const vscode = acquireVsCodeApi();

function sendMessage(message) {
    vscode.postMessage(message);
  }
  export default sendMessage;