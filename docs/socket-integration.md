# Socket.IO Integration for Real-time Messaging

This document describes the Socket.IO integration for real-time messaging functionality in the nanny-web application.

## Overview

The Socket.IO integration provides real-time communication features including:

- Real-time messaging
- Online user status
- Typing indicators
- Message read status
- User presence

## Architecture

### Files Created/Modified

1. **Socket Plugin** (`src/plugins/socket.client.js`)

   - Initializes Socket.IO client connection
   - Provides socket instance globally via Nuxt plugin

2. **Socket Composable** (`src/composables/useSocket.js`)

   - Provides reactive Socket.IO functionality
   - Handles connection, room management, and event listeners
   - Manages typing indicators and user status

3. **Message Store Updates** (`src/stores/message.ts`)

   - Added Socket.IO state management
   - Real-time message handling
   - User status and typing indicator management

4. **API Service** (`src/api/socket.ts`)

   - HTTP endpoints for Socket.IO related data
   - Initial data fetching for online users and status

5. **Page Integrations**
   - `src/pages/nanny/messages.vue` - Nanny messaging interface
   - `src/pages/client/messages.vue` - Client messaging interface

## Socket Events

### Client → Server Events

- `join-room` - Join a conversation room
- `leave-room` - Leave a conversation room
- `send-message` - Send a new message
- `typing` - Send typing indicator
- `mark-read` - Mark messages as read
- `get-user-status` - Request user status

### Server → Client Events

- `message-received` - New message received
- `user-status` - User online/offline status update
- `typing` - Typing indicator from other user
- `message-read` - Message read status update
- `online-users` - List of online users

## Backend Routes Required

The following routes need to be implemented on your backend:

```javascript
// Socket.IO routes
router.get("/socket/online-users", [SocketController, "getOnlineUsers"]);
router.post("/socket/mark-read", [SocketController, "markMessagesAsRead"]);
router.get("/socket/user-status", [SocketController, "getUserStatus"]);
router.post("/socket/typing", [SocketController, "sendTypingIndicator"]);
```

## Configuration

### Environment Variables

Add to your `.env` file:

```
SOCKET_URL=http://localhost:3000
```

### Nuxt Config

The socket URL is configured in `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    socketUrl: process.env.SOCKET_URL || "http://localhost:3000",
  },
}
```

## Usage

### In Vue Components

```javascript
import { useSocket } from "@/composables/useSocket";

export default {
  setup() {
    const {
      socket,
      isConnected,
      sendMessage,
      sendTypingIndicator,
      joinRoom,
      leaveRoom,
    } = useSocket();

    // Use socket functionality
  },
};
```

### In Pinia Stores

```javascript
import { useMessageStore } from "@/stores/message";

const messageStore = useMessageStore();

// Access real-time data
messageStore.onlineUsers;
messageStore.typingUsers;
messageStore.currentRoom;
```

## Features Implemented

### Real-time Messaging

- Messages are sent and received in real-time
- Automatic room joining/leaving
- Message persistence through store

### Typing Indicators

- Real-time typing status
- Automatic timeout handling
- Visual indicators in UI

### User Status

- Online/offline status
- Last seen timestamps
- Real-time status updates

### Message Read Status

- Mark messages as read
- Real-time read status updates
- Unread message indicators

## Installation

1. Install Socket.IO client:

```bash
npm install socket.io-client
```

2. The integration is already set up and ready to use.

## Testing

To test the integration:

1. Start your backend server with Socket.IO support
2. Open multiple browser tabs/windows
3. Navigate to the messages page
4. Send messages and observe real-time updates
5. Test typing indicators and user status

## Troubleshooting

### Connection Issues

- Check that the Socket.IO server is running
- Verify the `SOCKET_URL` environment variable
- Check browser console for connection errors

### Message Not Sending

- Ensure user is authenticated
- Check that the room is properly joined
- Verify backend Socket.IO event handlers

### Typing Indicators Not Working

- Check that typing events are being emitted
- Verify timeout handling
- Ensure proper cleanup on component unmount

## Future Enhancements

- Message delivery status
- File/image sharing
- Voice messages
- Video calls
- Push notifications
- Message encryption
