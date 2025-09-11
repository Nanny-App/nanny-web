import { api } from "@/utils/request";

export interface OnlineUser {
  id: string;
  name: string;
  userType: "nanny" | "parent";
  isOnline: boolean;
  lastSeen?: Date;
}

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface TypingIndicator {
  roomId: string;
  isTyping: boolean;
  userId: string;
  userType: "nanny" | "parent";
}

export interface MarkReadPayload {
  roomId: string;
  messageIds: string[];
  userId: string;
}

// Socket API endpoints (these will be called via HTTP to get initial data)
export const socketApi = {
  async getOnlineUsers(): Promise<{ users: OnlineUser[] }> {
    return api.get("/socket/online-users");
  },

  async getUserStatus(userId: string): Promise<UserStatus> {
    return api.get(`/socket/user-status?userId=${userId}`);
  },

  async markMessagesAsRead(
    payload: MarkReadPayload
  ): Promise<{ success: boolean }> {
    return api.post("/socket/mark-read", payload);
  },

  async sendTypingIndicator(
    payload: TypingIndicator
  ): Promise<{ success: boolean }> {
    return api.post("/socket/typing", payload);
  },
};
