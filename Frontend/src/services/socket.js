import { io } from "socket.io-client";

// Connect to backend (Vite proxy forwards WS as well, but socket.io needs direct URL in dev)
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  autoConnect: true
});

export default socket;
