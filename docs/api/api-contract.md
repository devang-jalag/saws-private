# SAWS API Contract

Shared source of truth for every HTTP endpoint in SmartCare Appointment and Wellness
System (SAWS). Backend and frontend build against this document instead of against each
other's code, so different modules can be developed in parallel. If an endpoint's shape
changes, update this file in the same merge request as the code change.

Each module owner adds their own section below, following the same format as
[Messaging](#messaging-gcp-pubsub--cloud-functions--firestore) and
[Notifications](#notifications-aws-snssqs--lambda). Example endpoints for other modules
(not yet specified here - add them as each module is designed):

```text
POST /auth/signup
POST /auth/login
GET  /appointments
POST /appointments
PUT  /appointments/{id}/approve
POST /feedback
GET  /analytics
```

## Conventions

- Base URL (AWS side): `https://api.saws.example/v1`
- Base URL (GCP side, Messaging module): `https://<region>-<project>.cloudfunctions.net`
- Auth: `Authorization: Bearer <Cognito ID token>` on every endpoint marked "Patient" or
  "Coordinator" below. Endpoints marked "Guest" require no token.
- Content type: `application/json` for every request/response body.
- Every list endpoint returns `{ "items": [...], "nextToken": "<string|null>" }`.
- Timestamps are ISO 8601 UTC strings, e.g. `2026-06-10T14:30:00Z`.

### Standard error shape

Every non-2xx response uses this envelope:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No concern exists with that id."
  }
}
```

| HTTP status | Meaning |
|---|---|
| 400 | Validation error (bad/missing fields) |
| 401 | Missing or invalid auth token |
| 403 | Authenticated but role doesn't allow this action |
| 404 | Resource doesn't exist |
| 409 | Conflict |
| 429 | Rate limited |
| 500 | Unhandled server error |

Common error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
`INTERNAL_ERROR`.

---

## Messaging (GCP Pub/Sub + Cloud Functions + Firestore)

Hosted on GCP; the frontend calls these directly with the same Cognito ID token (verified
inside the Cloud Function).

### POST /messaging/concerns — Patient

Request: `{ "concernText": "I cannot find my appointment reference code." }`

Response `202` (accepted, processed async):
```json
{ "concernId": "concern_001", "status": "SUBMITTED" }
```

Flow: Cloud Function publishes to `patient-concerns` Pub/Sub topic → coordinator-assignment
Cloud Function picks a random active coordinator → writes `communication_logs` doc in
Firestore → calls AWS Notifications to alert the coordinator.

### GET /messaging/concerns — Patient (own), Coordinator (assigned to them)

Response `200`: `{ "items": [ { "concernId", "patientId", "coordinatorId", "concernText", "responseText", "status", "createdAt", "assignedAt", "respondedAt" } ] }`

### PUT /messaging/concerns/{id}/respond — Coordinator

Request: `{ "responseText": "Your reference code is on the confirmation email." }`

Response `200`: the updated communication log, `status: "RESOLVED"`. Side effect:
notification to patient.

### Real-time chat — Patient, Coordinator

Not a REST endpoint. Both clients subscribe to `communication_logs/{concernId}/messages`
in Firestore with `onSnapshot`, and write new messages directly to that subcollection
(secured by `firestore.rules` restricting access to the patient and assigned coordinator).

---

## Notifications (AWS SNS/SQS + Lambda)

Notifications are fired internally by other modules (registration, login, booking,
cancellation) publishing to an SNS topic, plus a scheduled reminder job; there is no
public "send notification" endpoint. The one reader-facing endpoint is:

### GET /notifications/me — Patient, Coordinator

Response `200`: `{ "items": [ { "notificationId": "ntf_001", "type": "BOOKING", "message": "Your appointment is confirmed for 2026-06-15 14:00.", "createdAt": "..." } ] }`

Notification `type` values: `REGISTRATION`, `LOGIN`, `BOOKING`, `CANCELLATION`, `REMINDER`.

**Publishing contract for other modules:** to trigger a notification, publish a JSON
message to the shared SNS topic (ARN from `module.notifications` / the
`NOTIFICATIONS_TOPIC_ARN` env var) shaped as:

```json
{ "type": "BOOKING", "userId": "user_123", "message": "Your appointment is confirmed." }
```

The Notifications subscriber Lambda fans this out into the `saws-notifications` DynamoDB
table automatically - other modules don't need to know about that table.
