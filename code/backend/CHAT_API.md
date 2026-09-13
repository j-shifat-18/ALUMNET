# ALUMNET — Chat & Notification System API Reference

**Base URL:** `https://alumnet-production.up.railway.app/api/v1`  
**Local:** `http://localhost:8000/api/v1`

All endpoints require a Firebase ID token in the `Authorization` header unless stated otherwise.

---

## Authentication

Every request must include:

```
Authorization: Bearer <firebase_id_token>
```

On failure the server responds:

```json
{
  "success": false,
  "message": "Unauthorized Access"
}
```

or if the token is invalid/expired:

```json
{
  "success": false,
  "message": "Invalid Token"
}
```

---

## Standard Response Envelope

All successful responses follow this shape:

```json
{
  "success": true,
  "message": "Human-readable description",
  "data": { }
}
```

All error responses follow:

```json
{
  "success": false,
  "message": "Error description"
}
```

Validation errors (400) include an extra `errors` array:

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    { "field": "participantId", "message": "participantId must be a positive integer" }
  ]
}
```

---

---

# Conversations

---

## POST `/api/v1/conversations`

Create a new direct conversation with another user, or return the existing one if it already exists. Idempotent — calling this multiple times with the same `participantId` will always return the same conversation.

### Headers

| Header | Required | Value |
|--------|----------|-------|
| `Authorization` | ✅ | `Bearer <firebase_id_token>` |
| `Content-Type` | ✅ | `application/json` |

### Request Body

```json
{
  "participantId": 42
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `participantId` | `number` (integer) | ✅ | Must be a positive integer. Cannot be the current user's own ID. |

### Success Response — New conversation created `201`

```json
{
  "success": true,
  "message": "Conversation created successfully",
  "data": {
    "id": "clx1abc123",
    "type": "DIRECT",
    "createdAt": "2026-09-14T10:00:00.000Z",
    "updatedAt": "2026-09-14T10:00:00.000Z",
    "members": [
      {
        "id": "clx1member1",
        "conversationId": "clx1abc123",
        "userId": 1,
        "joinedAt": "2026-09-14T10:00:00.000Z",
        "lastReadAt": null,
        "user": {
          "id": 1,
          "uid": "firebase-uid-of-current-user",
          "name": "Shifat Ahmed",
          "username": "shifat",
          "profileImage": "https://example.com/avatar1.jpg",
          "isVerified": false
        }
      },
      {
        "id": "clx1member2",
        "conversationId": "clx1abc123",
        "userId": 42,
        "joinedAt": "2026-09-14T10:00:00.000Z",
        "lastReadAt": null,
        "user": {
          "id": 42,
          "uid": "firebase-uid-of-participant",
          "name": "Ahmed Rahman",
          "username": "ahmed.rahman",
          "profileImage": "https://example.com/avatar2.jpg",
          "isVerified": true
        }
      }
    ]
  }
}
```

### Success Response — Existing conversation returned `200`

Same shape as above, but `message` is `"Existing conversation retrieved"` and `statusCode` is `200`.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `400` | `"You cannot start a conversation with yourself"` | `participantId` equals the current user's DB id |
| `400` | `"Validation Error"` | Missing or invalid `participantId` |
| `401` | `"Unauthorized Access"` | Missing `Authorization` header |
| `404` | `"Participant user not found"` | No user with that `participantId` exists |

---

## GET `/api/v1/conversations`

Get all conversations for the authenticated user, ordered by most recently updated. Each item includes the other participant's profile, the last message preview, and the unread message count.

### Headers

| Header | Required | Value |
|--------|----------|-------|
| `Authorization` | ✅ | `Bearer <firebase_id_token>` |

### Request Body

None.

### Query Parameters

None.

### Success Response `200`

```json
{
  "success": true,
  "message": "Conversations retrieved successfully",
  "data": [
    {
      "id": "clx1abc123",
      "type": "DIRECT",
      "createdAt": "2026-09-14T10:00:00.000Z",
      "updatedAt": "2026-09-14T12:35:00.000Z",
      "participant": {
        "id": 42,
        "uid": "firebase-uid-of-participant",
        "name": "Ahmed Rahman",
        "username": "ahmed.rahman",
        "profileImage": "https://example.com/avatar2.jpg",
        "isVerified": true
      },
      "lastMessage": {
        "id": "clx1msg99",
        "content": "Are you available for a call?",
        "createdAt": "2026-09-14T12:35:00.000Z",
        "senderId": 42,
        "messageType": "TEXT"
      },
      "unreadCount": 3
    },
    {
      "id": "clx1def456",
      "type": "DIRECT",
      "createdAt": "2026-09-13T08:00:00.000Z",
      "updatedAt": "2026-09-13T09:10:00.000Z",
      "participant": {
        "id": 7,
        "uid": "firebase-uid-of-another-user",
        "name": "Nusrat Jahan",
        "username": "nusrat.jahan",
        "profileImage": null,
        "isVerified": false
      },
      "lastMessage": {
        "id": "clx1msg50",
        "content": "Thanks for the advice!",
        "createdAt": "2026-09-13T09:10:00.000Z",
        "senderId": 1,
        "messageType": "TEXT"
      },
      "unreadCount": 0
    }
  ]
}
```

> **`unreadCount`** — number of messages in this conversation sent by the other user after the current user's `lastReadAt`. If the current user has never read the conversation, all messages from the other user are counted.

> **`lastMessage`** — `null` if no messages have been sent yet.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized Access"` | Missing `Authorization` header |

---

## GET `/api/v1/conversations/:conversationId`

Get a single conversation by its ID. The authenticated user must be a member.

### Headers

| Header | Required | Value |
|--------|----------|-------|
| `Authorization` | ✅ | `Bearer <firebase_id_token>` |

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `conversationId` | `string` (cuid) | The ID of the conversation |

### Request Body

None.

### Success Response `200`

```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "data": {
    "id": "clx1abc123",
    "type": "DIRECT",
    "createdAt": "2026-09-14T10:00:00.000Z",
    "updatedAt": "2026-09-14T12:35:00.000Z",
    "members": [
      {
        "id": "clx1member1",
        "conversationId": "clx1abc123",
        "userId": 1,
        "joinedAt": "2026-09-14T10:00:00.000Z",
        "lastReadAt": "2026-09-14T12:00:00.000Z",
        "user": {
          "id": 1,
          "uid": "firebase-uid-of-current-user",
          "name": "Shifat Ahmed",
          "username": "shifat",
          "profileImage": "https://example.com/avatar1.jpg",
          "isVerified": false
        }
      },
      {
        "id": "clx1member2",
        "conversationId": "clx1abc123",
        "userId": 42,
        "joinedAt": "2026-09-14T10:00:00.000Z",
        "lastReadAt": "2026-09-14T12:35:00.000Z",
        "user": {
          "id": 42,
          "uid": "firebase-uid-of-participant",
          "name": "Ahmed Rahman",
          "username": "ahmed.rahman",
          "profileImage": "https://example.com/avatar2.jpg",
          "isVerified": true
        }
      }
    ]
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized Access"` | Missing `Authorization` header |
| `403` | `"You are not a member of this conversation"` | Caller is not in the conversation's member list |
| `404` | `"Conversation not found"` | No conversation with that ID exists |

---

## GET `/api/v1/conversations/:conversationId/messages`

Get paginated messages for a conversation, ordered newest first. Uses cursor-based pagination — pass the `nextCursor` from a previous response to load the next (older) page.

The authenticated user must be a member of the conversation.

### Headers

| Header | Required | Value |
|--------|----------|-------|
| `Authorization` | ✅ | `Bearer <firebase_id_token>` |

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `conversationId` | `string` (cuid) | The ID of the conversation |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `number` | `30` | Number of messages per page. Capped at `100`. |
| `cursor` | `string` | — | Message ID to paginate from (exclusive). Pass the `nextCursor` from the previous response. |

**First page (no cursor):**
```
GET /api/v1/conversations/clx1abc123/messages?limit=30
```

**Next page (with cursor):**
```
GET /api/v1/conversations/clx1abc123/messages?limit=30&cursor=clx1msg01
```

### Success Response `200`

```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": "clx1msg99",
        "conversationId": "clx1abc123",
        "senderId": 42,
        "content": "Are you available for a call?",
        "messageType": "TEXT",
        "createdAt": "2026-09-14T12:35:00.000Z",
        "updatedAt": "2026-09-14T12:35:00.000Z",
        "sender": {
          "id": 42,
          "uid": "firebase-uid-of-participant",
          "name": "Ahmed Rahman",
          "username": "ahmed.rahman",
          "profileImage": "https://example.com/avatar2.jpg",
          "isVerified": true
        }
      },
      {
        "id": "clx1msg98",
        "conversationId": "clx1abc123",
        "senderId": 1,
        "content": "Hello Ahmed! I wanted to ask about your career journey.",
        "messageType": "TEXT",
        "createdAt": "2026-09-14T12:30:00.000Z",
        "updatedAt": "2026-09-14T12:30:00.000Z",
        "sender": {
          "id": 1,
          "uid": "firebase-uid-of-current-user",
          "name": "Shifat Ahmed",
          "username": "shifat",
          "profileImage": "https://example.com/avatar1.jpg",
          "isVerified": false
        }
      }
    ],
    "nextCursor": "clx1msg98",
    "hasMore": true
  }
}
```

> **`messages`** — Array ordered newest → oldest. Render in reverse order in the UI.

> **`nextCursor`** — Pass this as `?cursor=` in the next request to load older messages. `null` when there are no more pages.

> **`hasMore`** — `false` when the full conversation history has been loaded.

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized Access"` | Missing `Authorization` header |
| `403` | `"You are not a member of this conversation"` | Caller is not a member |

---

## PATCH `/api/v1/conversations/:conversationId/read`

Mark a conversation as read for the current user. Updates `ConversationMember.lastReadAt` to the current timestamp, which resets the `unreadCount` to `0` the next time conversations are fetched.

Call this whenever the user opens a conversation view.

### Headers

| Header | Required | Value |
|--------|----------|-------|
| `Authorization` | ✅ | `Bearer <firebase_id_token>` |

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `conversationId` | `string` (cuid) | The ID of the conversation to mark as read |

### Request Body

None.

### Success Response `200`

```json
{
  "success": true,
  "message": "Conversation marked as read",
  "data": {
    "id": "clx1member1",
    "conversationId": "clx1abc123",
    "userId": 1,
    "joinedAt": "2026-09-14T10:00:00.000Z",
    "lastReadAt": "2026-09-14T12:40:00.000Z"
  }
}
```

### Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| `401` | `"Unauthorized Access"` | Missing `Authorization` header |
| `403` | `"You are not a member of this conversation"` | Caller is not a member |
| `404` | `"Conversation not found"` | No conversation with that ID exists |

---

---

# Notifications

> **Status:** Planned — Module 3 of the implementation roadmap.
>
> The `Notification` table and enums are already in the database. The REST endpoints below will be implemented in Module 3.

---

## GET `/api/v1/notifications` _(coming in Module 3)_

Get all notifications for the authenticated user, ordered newest first.

**Planned response shape:**

```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": "clx1notif1",
      "userId": 1,
      "type": "MESSAGE",
      "title": "New Message",
      "message": "Ahmed Rahman sent you a message",
      "data": {
        "conversationId": "clx1abc123",
        "senderId": 42
      },
      "isRead": false,
      "createdAt": "2026-09-14T12:35:00.000Z"
    },
    {
      "id": "clx1notif2",
      "userId": 1,
      "type": "MENTOR_REQUEST",
      "title": "New Mentorship Request",
      "message": "Nusrat Jahan sent you a mentorship request",
      "data": {
        "requestId": 17,
        "senderId": 7
      },
      "isRead": true,
      "createdAt": "2026-09-13T09:00:00.000Z"
    }
  ]
}
```

---

## GET `/api/v1/notifications/unread-count` _(coming in Module 3)_

Get the total number of unread notifications for the authenticated user.

**Planned response shape:**

```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "count": 5
  }
}
```

---

## PATCH `/api/v1/notifications/:notificationId/read` _(coming in Module 3)_

Mark a single notification as read.

**Planned response shape:**

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "clx1notif1",
    "isRead": true
  }
}
```

---

## PATCH `/api/v1/notifications/read-all` _(coming in Module 3)_

Mark all notifications as read for the authenticated user.

**Planned response shape:**

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 5
  }
}
```

---

---

# Socket.IO Events

> **Status:** ✅ Implemented — Module 2

The server and all chat events are live. Connect to the same host/port as the REST API.

---

## Connection

**Local:** `ws://localhost:8000`  
**Production:** `wss://alumnet-production.up.railway.app`

The client must send the Firebase ID token in the `auth` object on connection. The token is verified server-side with Firebase Admin — no separate login is needed.

```js
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  autoConnect: false,       // connect manually after the user is authenticated
  withCredentials: true,
  auth: { token: firebaseIdToken },  // ← Firebase ID token
});

// Connect after Firebase auth resolves
socket.connect();
```

### Connection error

If the token is missing, expired, or the Firebase UID has no matching DB user, the connection is **refused** with an error event:

```js
socket.on("connect_error", (err) => {
  console.error(err.message);
  // "Authentication error: token missing"
  // "Authentication error: invalid token"
  // "Authentication error: user not found"
});
```

---

## Rooms

The server automatically manages two room types:

| Room format | Joined by | Purpose |
|-------------|-----------|---------|
| `user:{userId}` | Server on connect | Personal room — notifications, presence |
| `conversation:{conversationId}` | Client via `join_conversation` | Conversation broadcast |

---

## Events — Client → Server

---

### `join_conversation`

Join a conversation room to receive real-time messages. The server verifies the user is a member before allowing the join.

**Payload:**
```json
{ "conversationId": "clx1abc123" }
```

**Emits back on error:**
```json
{
  "event": "message_error",
  "data": {
    "code": "NOT_CONVERSATION_MEMBER",
    "message": "You are not a member of this conversation."
  }
}
```

Call this when the user navigates to a conversation view.

---

### `leave_conversation`

Leave a conversation room. Call when the user navigates away.

**Payload:**
```json
{ "conversationId": "clx1abc123" }
```

No response emitted.

---

### `send_message`

Send a message. The server validates content, checks membership, persists to PostgreSQL, then broadcasts `new_message` to the conversation room.

**`senderId` is always derived from the authenticated socket — never trust a `senderId` from the client payload.**

**Payload:**
```json
{
  "conversationId": "clx1abc123",
  "content": "Hello Ahmed! I wanted to ask about your career journey."
}
```

| Field | Type | Validation |
|-------|------|------------|
| `conversationId` | `string` | Must be a valid conversation the user belongs to |
| `content` | `string` | 1–2000 characters, trimmed |

**Emits back on error:**
```json
{
  "event": "message_error",
  "data": {
    "code": "RATE_LIMITED",
    "message": "You are sending messages too fast. Please slow down."
  }
}
```

**Rate limit:** 20 messages per 10 seconds per socket connection.

---

### `typing_start`

Notify others in the conversation that the user has started typing. Never stored in the database.

**Payload:**
```json
{ "conversationId": "clx1abc123" }
```

---

### `typing_stop`

Notify others that the user has stopped typing.

**Payload:**
```json
{ "conversationId": "clx1abc123" }
```

---

### `message_read`

Mark a conversation as read. Updates `ConversationMember.lastReadAt` and notifies the other members.

**Payload:**
```json
{ "conversationId": "clx1abc123" }
```

---

## Events — Server → Client

---

### `new_message`

Broadcast to everyone in `conversation:{conversationId}` when a new message is saved to the database. This is the canonical real-time message delivery event.

**Payload:**
```json
{
  "id": "clx1msg99",
  "conversationId": "clx1abc123",
  "senderId": 42,
  "content": "Hello Ahmed! I wanted to ask about your career journey.",
  "messageType": "TEXT",
  "createdAt": "2026-09-14T12:35:00.000Z",
  "updatedAt": "2026-09-14T12:35:00.000Z",
  "sender": {
    "id": 42,
    "uid": "firebase-uid-of-sender",
    "name": "Ahmed Rahman",
    "username": "ahmed.rahman",
    "profileImage": "https://example.com/avatar2.jpg",
    "isVerified": true
  }
}
```

---

### `message_error`

Sent only to the socket that triggered the error (not broadcast).

**Payload:**
```json
{
  "code": "NOT_CONVERSATION_MEMBER",
  "message": "You are not a member of this conversation."
}
```

**Error codes:**

| Code | Meaning |
|------|---------|
| `NOT_CONVERSATION_MEMBER` | User tried to send/join a conversation they don't belong to |
| `INVALID_CONTENT` | Empty message, too long (>2000 chars), or wrong type |
| `RATE_LIMITED` | More than 20 messages in 10 seconds |
| `SERVER_ERROR` | Unexpected server-side failure |

---

### `message_notification`

Sent to `user:{userId}` when a new message arrives **and the recipient is not currently in the conversation room**. Used to update unread badges without a full notification record (full `Notification` records are created in Module 3).

**Payload:**
```json
{
  "conversationId": "clx1abc123",
  "message": {
    "id": "clx1msg99",
    "content": "Hello Ahmed!",
    "senderId": 42,
    "createdAt": "2026-09-14T12:35:00.000Z"
  },
  "sender": {
    "id": 42,
    "uid": "firebase-uid-of-sender",
    "name": "Ahmed Rahman",
    "username": "ahmed.rahman",
    "profileImage": "https://example.com/avatar2.jpg",
    "isVerified": true
  }
}
```

---

### `user_typing`

Broadcast to all other sockets in `conversation:{conversationId}` when a member starts typing. Use this to show "Ahmed is typing…".

**Payload:**
```json
{
  "userId": 42,
  "conversationId": "clx1abc123"
}
```

---

### `user_stopped_typing`

Broadcast when a member stops typing.

**Payload:**
```json
{
  "userId": 42,
  "conversationId": "clx1abc123"
}
```

---

### `messages_read`

Broadcast to all other sockets in the conversation room when a member calls `message_read`. Use this to update read receipt checkmarks (✓✓).

**Payload:**
```json
{
  "conversationId": "clx1abc123",
  "userId": 1,
  "readAt": "2026-09-14T12:40:00.000Z"
}
```

---

### `user_online`

Broadcast to **all connected sockets** (not room-specific) when a user connects for the first time (i.e. was offline before). Use this to show the 🟢 online indicator.

**Payload:**
```json
{ "userId": 42 }
```

---

### `user_offline`

Broadcast to all connected sockets when a user's last socket connection drops.

**Payload:**
```json
{ "userId": 42 }
```

---

### `notification` _(Module 3)_

Sent to `user:{userId}` personal room when a notification is created. Full `Notification` object — see the Notifications section.

---

## Full Client-Side Flow Example

```js
// 1. Connect after Firebase auth
const token = await firebaseUser.getIdToken();
const socket = io(API_URL, { auth: { token }, withCredentials: true });

// 2. Listen for connection errors
socket.on("connect_error", (err) => console.error(err.message));

// 3. When user opens a conversation
socket.emit("join_conversation", { conversationId: "clx1abc123" });

// 4. Receive messages in real time
socket.on("new_message", (message) => {
  // append message to the chat view
  // if user is viewing this conversation, also emit message_read
  socket.emit("message_read", { conversationId: message.conversationId });
});

// 5. Send a message
socket.emit("send_message", {
  conversationId: "clx1abc123",
  content: "Hello Ahmed!",
});

// 6. Typing indicators
inputEl.addEventListener("input", () => {
  socket.emit("typing_start", { conversationId: "clx1abc123" });
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit("typing_stop", { conversationId: "clx1abc123" });
  }, 1500);
});

socket.on("user_typing",         ({ userId }) => showTypingIndicator(userId));
socket.on("user_stopped_typing", ({ userId }) => hideTypingIndicator(userId));

// 7. Online status
socket.on("user_online",  ({ userId }) => setOnline(userId));
socket.on("user_offline", ({ userId }) => setOffline(userId));

// 8. Unread badge (before Module 3 notifications are ready)
socket.on("message_notification", ({ conversationId, sender }) => {
  incrementUnreadBadge(conversationId);
});

// 9. Read receipts
socket.on("messages_read", ({ conversationId, userId, readAt }) => {
  updateReadReceipts(conversationId, userId, readAt);
});

// 10. Leave when navigating away
socket.emit("leave_conversation", { conversationId: "clx1abc123" });
```

---

---

# Data Models

### `Conversation`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (cuid) | Unique identifier |
| `type` | `"DIRECT" \| "GROUP"` | Conversation type (only DIRECT implemented in v1) |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last activity timestamp |

### `ConversationMember`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (cuid) | Unique identifier |
| `conversationId` | `string` | Reference to `Conversation.id` |
| `userId` | `number` | Reference to `User.id` |
| `joinedAt` | `DateTime` | When the user joined |
| `lastReadAt` | `DateTime \| null` | Last time user read this conversation. Used to calculate `unreadCount`. |

### `Message`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (cuid) | Unique identifier |
| `conversationId` | `string` | Reference to `Conversation.id` |
| `senderId` | `number` | Reference to `User.id` of the sender |
| `content` | `string` | Message text (1–2000 characters) |
| `messageType` | `"TEXT" \| "IMAGE" \| "FILE"` | Type of message (only TEXT in v1) |
| `createdAt` | `DateTime` | Send timestamp |
| `updatedAt` | `DateTime` | Last updated timestamp |

### `Notification`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (cuid) | Unique identifier |
| `userId` | `number` | Recipient — reference to `User.id` |
| `type` | `NotificationType` | See enum below |
| `title` | `string` | Short notification title |
| `message` | `string` | Full notification text |
| `data` | `JSON \| null` | Contextual data for navigation (e.g. `conversationId`, `requestId`) |
| `isRead` | `boolean` | Whether the user has read this notification |
| `createdAt` | `DateTime` | Creation timestamp |

### `NotificationType` enum

| Value | Trigger |
|-------|---------|
| `MESSAGE` | A user sends a chat message |
| `MENTOR_REQUEST` | A student sends a mentorship request |
| `MENTOR_REQUEST_ACCEPTED` | An alumni accepts a mentorship request |
| `POST_LIKE` | A user likes a post |
| `POST_COMMENT` | A user comments on a post |
| `EVENT_CREATED` | An event is created |
| `SYSTEM` | System-generated announcements |

---

---

# Changelog

| Date | Module | Change |
|------|--------|--------|
| 2026-09-14 | Module 1 | Initial implementation — Conversation, Message REST APIs |
| 2026-09-14 | Module 2 | Socket.IO server live — send_message, new_message, typing, read receipts, presence, rate limiting |
| — | Module 3 | Notification REST APIs + real-time delivery _(planned)_ |
| — | Module 4 | ALUMNET-wide notification integration _(planned)_ |
