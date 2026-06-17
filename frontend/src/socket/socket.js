import { io } from "socket.io-client";

const localBackend = import.meta.env.VITE_API_URL_LOCAL;
const remoteBackend = import.meta.env.VITE_API_URL_REMOTE;
const useLocal = import.meta.env.VITE_USE_LOCAL_BACKEND !== "false";
const ENDPOINT =
  (useLocal && localBackend) ||
  remoteBackend ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const socket = io(ENDPOINT);
