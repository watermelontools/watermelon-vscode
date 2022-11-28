import sendMessage from "./sendVSCodeMessage.js";

export default function sendLinkToOpen({ link, source }) {
  sendMessage({
    command: "link",
    link,
  });
}
