// set to true to start logging
export default function debugLogger(
  message: string,
  shouldLog: boolean = false
) {
  if (shouldLog) {
    console.log(message);
  }
}
