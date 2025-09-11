import { io } from "socket.io-client";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Create socket connection
  const socket = io(config.public.socketUrl || "http://localhost:3333", {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return {
    provide: {
      socket,
    },
  };
});
