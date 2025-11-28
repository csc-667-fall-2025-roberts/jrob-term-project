import socketIo from "socket.io-client";

import type { ChatMessage } from "@shared/types";

import * as chatKeys from "../shared/keys";

const socket = socketIo();

const listing = document.querySelector<HTMLDivElement>("#message-listing")!;
const input = document.querySelector<HTMLInputElement>("#message-submit input")!;
const button = document.querySelector<HTMLButtonElement>("#message-submit button")!;
const messageTemplate = document.querySelector<HTMLTemplateElement>("#template-chat-message")!;

const appendMessage = ({ username, created_at, message }: ChatMessage) => {
  const clone = messageTemplate.content.cloneNode(true) as DocumentFragment;

  const timeSpan = clone.querySelector(".message-time") as HTMLElement;
  const time = new Date(created_at);
  timeSpan!.textContent = formatTimeAgo(time);
  // @ts-expect-error dataset accepts string values
  timeSpan!.dataset.timestamp = created_at;

  const usernameSpan = clone.querySelector(".message-username");
  usernameSpan!.textContent = username;

  const msgSpan = clone.querySelector(".message-text");
  msgSpan!.textContent = message;

  listing.appendChild(clone);

  // Auto-scroll to bottom
  listing.scrollTop = listing.scrollHeight;
};

socket.on(chatKeys.CHAT_LISTING, ({ messages }: { messages: ChatMessage[] }) => {
  console.log(chatKeys.CHAT_LISTING, { messages });

  messages.forEach((message) => {
    appendMessage(message);
  });
});

socket.on(chatKeys.CHAT_MESSAGE, (message: ChatMessage) => {
  console.log(chatKeys.CHAT_MESSAGE, message);

  appendMessage(message);
});

const sendMessage = () => {
  const message = input.value.trim();

  if (message.length > 0) {
    const body = JSON.stringify({ message });

    fetch("/chat/", {
      method: "post",
      body,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  input.value = "";
};

button.addEventListener("click", (event) => {
  event.preventDefault();

  sendMessage();
});

input.addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    sendMessage();
  }
});

// Load message history when page loads
fetch("/chat/", {
  method: "get",
  credentials: "include",
});

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

const updateAllTimestamps = () => {
  const timeElements = listing.querySelectorAll<HTMLElement>(".message-time");
  timeElements.forEach((element) => {
    const timestamp = element.dataset.timestamp;
    if (timestamp) {
      element.textContent = formatTimeAgo(new Date(timestamp));
    }
  });
};

setInterval(updateAllTimestamps, 10000);
