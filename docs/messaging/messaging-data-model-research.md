# Messaging Data Model Research

## 1. Purpose

The messaging module needs to store patient concerns, coordinator assignments, responses, and chat messages. This document proposes the minimum data structures needed for the asynchronous support flow and the real-time chat.

This is a planning document for Sprint 1. The structures are written as Firestore collections but the same shapes work as DynamoDB tables if the team direction changes.

## 2. Design Idea

Three kinds of data are stored:

```text
coordinators        → who can receive concerns (availability)
communication_logs  → asynchronous concern + response records
chats/{chatId}/messages → real-time chat messages
```

The Pub/Sub message itself is not stored — it is transport only. Everything that needs to persist is written by the Cloud Function into Firestore.

## 3. Pub/Sub Message Shape

This is the payload published to the `patient-concerns` topic. It is small on purpose; the function enriches it before storing.

```json
{
  "patientId": "user_123",
  "concernText": "I cannot find my appointment reference code.",
  "submittedAt": "2026-06-10T14:30:00Z",
  "source": "SUPPORT_FORM"
}
```

### Possible Source Values

- `SUPPORT_FORM`
- `CHATBOT`

Both the support form and the virtual assistant publish to the same topic so there is one pipeline.

## 4. Coordinators Collection

Stores which coordinators can receive new concerns.

```json
{
  "coordinatorId": "coord_007",
  "fullName": "Example Coordinator",
  "available": true,
  "openConcernCount": 3,
  "lastAssignedAt": "2026-06-10T13:00:00Z"
}
```

### Why These Fields

- `available` lets the random selection skip coordinators who are off shift.
- `openConcernCount` and `lastAssignedAt` are not required for random assignment but make it possible to switch to fairer load-based assignment later without changing the data model.

## 5. Communication Logs Collection

Stores the full asynchronous exchange. One document per concern.

```json
{
  "logId": "log_0042",
  "patientId": "user_123",
  "coordinatorId": "coord_007",
  "concernText": "I cannot find my appointment reference code.",
  "responseText": null,
  "status": "OPEN",
  "source": "SUPPORT_FORM",
  "createdAt": "2026-06-10T14:30:05Z",
  "assignedAt": "2026-06-10T14:30:06Z",
  "respondedAt": null
}
```

### Possible Status Values

- `OPEN` — assigned, waiting for coordinator
- `ANSWERED` — coordinator responded
- `CLOSED` — patient confirmed resolution (optional)

### Analytics Supported

- Number of concerns per day/week
- Average response time (`respondedAt` − `createdAt`)
- Concerns per coordinator
- Open vs answered ratio

The timestamps exist mainly so the analytics module can compute these later without changing this model.

## 6. Chats Collection (Real-Time Feature)

Chat metadata and messages are separated so listeners stay cheap.

Chat document:

```json
{
  "chatId": "chat_310",
  "patientId": "user_123",
  "coordinatorId": "coord_007",
  "createdAt": "2026-06-10T15:00:00Z",
  "status": "ACTIVE"
}
```

Message document in `chats/{chatId}/messages`:

```json
{
  "messageId": "msg_0001",
  "senderId": "user_123",
  "senderRole": "PATIENT",
  "text": "Hi, are you available to talk about my appointment?",
  "sentAt": "2026-06-10T15:00:10Z"
}
```

Clients attach an `onSnapshot` listener on the messages subcollection ordered by `sentAt`, so new messages appear instantly.

## 7. Privacy Rules

Concerns and chats can contain personal health information, so access must be restricted.

| Data | Who Can Read | Who Can Write |
|---|---|---|
| communication_logs document | The patient who created it + the assigned coordinator | Cloud Function (create), assigned coordinator (response) |
| chats + messages | The two participants only | The two participants only |
| coordinators | Cloud Function (for selection); coordinators can update own availability | Coordinator (own document) |

In Firestore these rules are written as security rules comparing `request.auth.uid` with `patientId` / `coordinatorId` fields.

## 8. Minimum Data Needed for Sprint 2 Prototype

For a simple prototype, the team only needs sample records for:

- 3 coordinators (2 available, 1 unavailable)
- 10 communication logs in mixed statuses
- 1 chat with about 10 messages

This is enough to demonstrate publish → assign → log → respond and a working live chat.
