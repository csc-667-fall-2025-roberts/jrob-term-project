import socketIo from "socket.io-client";
import type { ChatMessage } from "../backend/types/types";
import * as messageKeys from "../shared/chat-keys";

const socket = socketIo();
const listing = document.querySelector<HTMLDivElement>("#message-listing")!;
const messageText = document.querySelector<HTMLInputElement>("#message-submit input")!;
const submitButton = document.querySelector<HTMLDivElement>("#message-submit button")!;

const appendMessage = (message: string) => {
  const messageDiv = document.createElement("div");
  messageDiv.innerText = message;

  listing.appendChild(messageDiv);
};

socket.on(messageKeys.CHAT_LISTING(), ({ messages }: { messages: ChatMessage[] }) => {
  messages.forEach((message) => {
    console.log(messageKeys.CHAT_LISTING(), message);
    appendMessage(`${message.username} (${message.created_at}): ${message.message}`);
  });
});

socket.on(messageKeys.CHAT_MESSAGE(), (message: ChatMessage) => {
  console.log(messageKeys.CHAT_MESSAGE(), message);
  appendMessage(`${message.username} (${message.created_at}): ${message.message}`);
});

const sendMessage = () => {
  const message = messageText.value.trim();
  const body = JSON.stringify({ message });

  if (message.length > 0) {
    fetch("/chat/", {
      method: "post",
      body,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  }

  messageText.value = "";
};

submitButton.addEventListener("click", (event) => {
  event.preventDefault();

  sendMessage();
});

messageText.addEventListener("keydown", (event) => {
  if (event.key === "\n") {
    sendMessage();
  }
});

/*
    <div id="chat-area">
      <div id="message-listing"></div>
      <div id="message-submit">
        <input type="text" />
        <button>Send</button>
      </div>
    </div>
*/
