# Messaging + Notifications — API Reference

Every request/response below is a **real, captured example** from testing this module
against an actual deployment (AWS Learner Lab account `232298925019` in `us-east-1`, GCP
project `b01075422`), not a hypothetical shape. Where the deployed behavior differs from
the original design in [docs/api/api-contract.md](../docs/api/api-contract.md), that's
called out explicitly — this file describes what's actually true today.

## Auth

Every endpoint verifies a Cognito ID token: `Authorization: Bearer <token>`. Role is read
from the `cognito:groups` claim — membership in a `coordinator` group means `COORDINATOR`,
otherwise `PATIENT`. There is no guest access on this module's endpoints.

## Base URLs (this sprint's throwaway deployment)

| Side | Base URL |
|---|---|
| GCP (Messaging) | `https://us-central1-b01075422.cloudfunctions.net` |
| AWS (Notifications) | `https://91fahsy5hg.execute-api.us-east-1.amazonaws.com` |

These are per-deployment (Terraform outputs `messaging_submit_concern_url`,
`messaging_respond_to_concern_url`, `messaging_list_concerns_url`,
`notifications_api_endpoint`) — expect them to change on the next `terraform apply` unless
the same project/environment is reused.

---

## Messaging (GCP Cloud Functions)

### `POST /saws-<env>-submit-concern` — Patient

**Deviation from the original design:** each Cloud Function gets one flat URL (no path
routing), so the logical route `POST /messaging/concerns` is just the function's own URL
directly — there's no `/messaging/concerns` path segment in reality.

Request:
```json
{ "concernText": "I cannot find my appointment reference code." }
```

Response `202`:
```json
{ "concernId": "concern_997541eb-583b-4172-bb1b-19ce8fdcebfa", "status": "SUBMITTED" }
```

Errors: `400 VALIDATION_ERROR` (missing `concernText`), `401 UNAUTHORIZED` (missing/invalid
bearer token).

Side effect (async, via Pub/Sub): a random active coordinator is assigned and notified.

### `GET /saws-<env>-list-concerns` — Patient (own), Coordinator (assigned to them)

Response `200` (as coordinator, after a concern was auto-assigned):
```json
{
  "items": [
    {
      "concernId": "concern_997541eb-583b-4172-bb1b-19ce8fdcebfa",
      "patientId": "f448f4f8-a0e1-705d-730f-7f78e802dbaf",
      "coordinatorId": "d4187428-e0e1-70b3-cc88-93040c0c575f",
      "concernText": "I cannot find my appointment reference code.",
      "responseText": null,
      "status": "OPEN",
      "createdAt": "2026-07-05T18:06:05.000Z",
      "assignedAt": "2026-07-05T18:06:09.600Z",
      "respondedAt": null
    }
  ]
}
```

`status` is one of `OPEN` (assigned, awaiting response), `UNASSIGNED` (no active
coordinator was available), `RESOLVED` (responded to).

### `PUT /saws-<env>-respond-to-concern?id={concernId}` — Coordinator

**Deviation from the original design:** the id is a **query parameter** (`?id=...`), not a
path segment (`/messaging/concerns/{id}/respond`) — same reason as above, flat function
URLs don't support path params without adding a routing layer (e.g. API Gateway in front),
which this module doesn't have on the GCP side.

Request:
```json
{ "responseText": "Your reference code is on the confirmation email." }
```

Response `200`:
```json
{
  "patientId": "f448f4f8-a0e1-705d-730f-7f78e802dbaf",
  "coordinatorId": "d4187428-e0e1-70b3-cc88-93040c0c575f",
  "concernText": "I cannot find my appointment reference code.",
  "responseText": "Your reference code is on the confirmation email.",
  "status": "RESOLVED",
  "createdAt": "2026-07-05T18:06:05.000Z",
  "assignedAt": "2026-07-05T18:06:09.600Z",
  "respondedAt": "2026-07-05T18:10:00.549Z",
  "concernId": "concern_997541eb-583b-4172-bb1b-19ce8fdcebfa"
}
```

Errors: `400 VALIDATION_ERROR` (missing `id` or `responseText`), `403 FORBIDDEN` (caller
isn't a coordinator, or isn't the coordinator this concern is assigned to),
`404 NOT_FOUND` (no concern with that id).

Side effect: publishes a `BOOKING`-type notification to the patient (see below).

### Real-time chat

Not a REST endpoint. Patient and coordinator both subscribe to
`communication_logs/{concernId}/messages` in Firestore with `onSnapshot` and write new
messages directly to that subcollection — access restricted by `gcp/firestore.rules` to
just the patient and assigned coordinator.

---

## Notifications (AWS Lambda + API Gateway)

### `GET /notifications/me` — Patient, Coordinator

Response `200` (coordinator, after being assigned a concern):
```json
{
  "items": [
    {
      "notificationId": "ntf_3f388e21-2a2b-43eb-a1df-ff8745a54366",
      "type": "BOOKING",
      "message": "A new patient concern (concern_997541eb-583b-4172-bb1b-19ce8fdcebfa) has been assigned to you.",
      "createdAt": "2026-07-05T18:06:13.318Z",
      "userId": "d4187428-e0e1-70b3-cc88-93040c0c575f"
    }
  ]
}
```

Response `200` (patient, after the coordinator responded):
```json
{
  "items": [
    {
      "notificationId": "ntf_fc5936c2-1504-4e04-9ef9-309368576ca5",
      "type": "BOOKING",
      "message": "A wellness coordinator responded to your concern: Your reference code is on the confirmation email.",
      "createdAt": "2026-07-05T18:10:01.431Z",
      "userId": "f448f4f8-a0e1-705d-730f-7f78e802dbaf"
    }
  ]
}
```

Errors: `401 UNAUTHORIZED` (missing/invalid bearer token).

### Publishing contract (for other modules, not a public endpoint)

Any module can trigger a notification by publishing to the shared SNS topic
(`NOTIFICATIONS_TOPIC_ARN`, output as `notifications_topic_arn`):

```json
{ "type": "BOOKING", "userId": "user_123", "message": "Your appointment is confirmed." }
```

`type` is one of `REGISTRATION`, `LOGIN`, `BOOKING`, `CANCELLATION`, `REMINDER`. This
module's subscriber Lambda fans it into `saws-notifications` automatically — publishers
never touch that table directly.

---

## Error shape (both sides)

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "concernText is required." } }
```

| Status | Meaning |
|---|---|
| 400 | Validation error |
| 401 | Missing/invalid auth token |
| 403 | Authenticated but not allowed to do this |
| 404 | Resource doesn't exist |
| 500 | Unhandled server error |
