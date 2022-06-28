export default function webviewDebugLogger(message, shouldLog = false) {
  if (shouldLog) {
    console.log(message);
  }
}
