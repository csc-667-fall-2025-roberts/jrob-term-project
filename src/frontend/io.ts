import socketIo from "socket.io-client";

const socket = socketIo();

const status = document.getElementById("socket-status")!;

socket.on("connect", () => {
  status.textContent = "Socket.io: Connected";
  status.className = "status connected";
  console.log("Connected to socket.io");
});

socket.on("close", () => {
  status.textContent = "Socket.io: Disconnected";
  status.className = "status disconnected";
  console.log("Disconnected from socket.io");
});
