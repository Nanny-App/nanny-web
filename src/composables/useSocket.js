import { ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";

export const useSocket = () => {
  const { $socket } = useNuxtApp();
  const authStore = useAuthStore();

  const isConnected = ref(false);
  const onlineUsers = ref([]);
  const typingUsers = ref(new Map());

  // Socket event handlers
  const connect = () => {
    if (authStore.token?.token) {
      $socket.auth = {
        token: authStore.token.token,
      };
      $socket.connect();
    }
  };

  const disconnect = () => {
    $socket.disconnect();
  };

  const joinRoom = (roomId) => {
    if ($socket.connected) {
      $socket.emit("join-room", roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if ($socket.connected) {
      $socket.emit("leave-room", roomId);
    }
  };

  const sendMessage = (roomId, message) => {
    if ($socket.connected) {
      $socket.emit("send-message", {
        roomId,
        message,
        senderId: authStore.user?.id,
        senderType: authStore.user?.userType,
      });
    }
  };

  const sendTypingIndicator = (roomId, isTyping) => {
    if ($socket.connected) {
      $socket.emit("typing", {
        roomId,
        isTyping,
        userId: authStore.user?.id,
        userType: authStore.user?.userType,
      });
    }
  };

  const markMessagesAsRead = (roomId, messageIds) => {
    if ($socket.connected) {
      $socket.emit("mark-read", {
        roomId,
        messageIds,
        userId: authStore.user?.id,
      });
    }
  };

  const getUserStatus = (userId) => {
    if ($socket.connected) {
      $socket.emit("get-user-status", userId);
    }
  };

  // Event listeners
  const setupEventListeners = () => {
    $socket.on("connect", () => {
      isConnected.value = true;
      console.log("Socket connected");
    });

    $socket.on("disconnect", () => {
      isConnected.value = false;
      console.log("Socket disconnected");
    });

    $socket.on("online-users", (users) => {
      onlineUsers.value = users;
    });

    $socket.on("user-status", (data) => {
      const { userId, isOnline, lastSeen } = data;
    });

    $socket.on("typing", (data) => {
      const { userId, isTyping, userType } = data;
      if (isTyping) {
        typingUsers.value.set(userId, { userType, timestamp: Date.now() });
      } else {
        typingUsers.value.delete(userId);
      }
    });

    // $socket.on("message-received", (message) => {
    //   // Handle new message received
    //   // This will be handled by the message store
    // });

    // $socket.on("message-read", (data) => {
    //   // Handle message read status update
    //   // This will be handled by the message store
    // });
  };

  const removeEventListeners = () => {
    $socket.off("connect");
    $socket.off("disconnect");
    $socket.off("online-users");
    $socket.off("user-status");
    $socket.off("typing");
    $socket.off("message-received");
    $socket.off("message-read");
  };

  onMounted(() => {
    setupEventListeners();
    connect();
  });

  onUnmounted(() => {
    removeEventListeners();
    disconnect();
  });

  return {
    socket: $socket,
    isConnected,
    onlineUsers,
    typingUsers,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTypingIndicator,
    markMessagesAsRead,
    getUserStatus,
  };
};
