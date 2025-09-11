import { defineStore } from "pinia";
import { chatApi, type Chat, type Message } from "@/api/chat";

// Removed local Message and Chat type definitions to avoid conflicts

interface MessageState {
  messages: Message[];
  chats: Chat[];
  loading: boolean;
  loadingChats: boolean;
  error: string | null;
  chatsError: string | null;
  onlineUsers: any[];
  typingUsers: Map<string, any>;
  currentRoom: string | null;
}

export const useMessageStore = defineStore("message", {
  state: (): MessageState => ({
    messages: [],
    chats: [],
    loading: false,
    loadingChats: false,
    error: null,
    chatsError: null,
    onlineUsers: [],
    typingUsers: new Map(),
    currentRoom: null,
  }),
  actions: {
    async fetchMessages(chatId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await chatApi.getMessages(chatId);
        this.messages = res.messages;
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to load messages";
      } finally {
        this.loading = false;
      }
    },
    async sendMessage(chatId: string, message: string) {
      this.loading = true;
      this.error = null;
      try {
        await chatApi.sendMessage(chatId, message);
        // Optionally, refetch messages after sending
        await this.fetchMessages(chatId);
      } catch (error: any) {
        this.error = error.response?.data?.message || "Failed to send message";
      } finally {
        this.loading = false;
      }
    },
    async fetchChats() {
      this.loadingChats = true;
      this.chatsError = null;
      try {
        const res = await chatApi.getChats();
        const formattedChats = [];
        res.chats.map((chat) => {
          const lastMessage =
            chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1]
              : null;

          formattedChats.push({
            id: chat.id,
            name: chat.parent.name,
            avatar: "",
            lastMessage: lastMessage?.content || "",
            lastMessageTime: lastMessage?.createdAt || new Date(),
            unread: lastMessage?.read_status || false,
            messages:
              chat.messages?.map((message) => ({
                sender: message.sender.userType,
                text: message.content,
                time: message.createdAt,
              })) || [],
          });
        });
        console.log(formattedChats);
        this.chats = formattedChats;
      } catch (error: any) {
        this.chatsError =
          error.response?.data?.message || "Failed to load chats";
      } finally {
        this.loadingChats = false;
      }
    },
    clearMessages() {
      this.messages = [];
    },
    clearChats() {
      this.chats = [];
    },
    clearError() {
      this.error = null;
      this.chatsError = null;
    },

    // Socket.IO related actions
    setOnlineUsers(users: any[]) {
      this.onlineUsers = users;
    },

    updateUserStatus(userId: string, isOnline: boolean, lastSeen?: Date) {
      this.chats.forEach((chat) => {
        if (chat.parent?.id === userId || chat.nanny?.id === userId) {
          // Add isOnline and lastSeen properties dynamically
          (chat as any).isOnline = isOnline;
          if (lastSeen) {
            (chat as any).lastSeen = lastSeen;
          }
        }
      });
    },

    setTypingUser(userId: string, userType: string, isTyping: boolean) {
      if (isTyping) {
        this.typingUsers.set(userId, { userType, timestamp: Date.now() });
      } else {
        this.typingUsers.delete(userId);
      }
    },

    addMessage(message: Message & { chatId?: string }) {
      // Add message to current chat if it matches
      const chat = this.chats.find((c) => c.id === message.chatId);
      if (chat) {
        chat.messages.push(message);
        // Add lastMessage and lastMessageTime dynamically
        (chat as any).lastMessage = message.content;
        (chat as any).lastMessageTime = message.createdAt;
      }

      // Add to messages if it's the current room
      if (this.currentRoom === message.chatId) {
        this.messages.push(message);
      }
    },

    updateMessageReadStatus(messageIds: string[], readBy: string) {
      this.messages.forEach((message) => {
        if (messageIds.includes(message.id)) {
          // Add readBy and readAt properties dynamically
          (message as any).readBy = readBy;
          (message as any).readAt = new Date();
        }
      });
    },

    setCurrentRoom(roomId: string | null) {
      this.currentRoom = roomId;
    },

    clearTypingUsers() {
      this.typingUsers.clear();
    },
  },
});
