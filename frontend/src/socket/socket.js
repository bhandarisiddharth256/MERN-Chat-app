import { io } from "socket.io-client";

const ENDPOINT = "https://mern-chat-app-8oxm.onrender.com/";

export const socket = io(ENDPOINT);
