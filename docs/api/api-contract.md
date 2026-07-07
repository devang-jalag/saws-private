# SAWS API Contract — Sprint 2

**Status:** Analytics & Feedback endpoints below are **implemented** (`backend/`) and match the running code exactly. Auth and Appointments endpoints are **proposed** — nobody has built them yet as of this writing, so their owning module should confirm/adjust before frontend integration locks in.

This document exists so backend and frontend work can proceed in parallel without guessing field names. If you change a request/response shape, update this file in the same merge request.

## Conventions

- Base URL (local dev): `http://localhost:4000/api` (analytics/feedback/services) — auth/appointments base URL TBD by their owner.
- All request/response bodies are JSON. `Content-Type: application/json`.
- Authenticated routes expect `Authorization: Bearer <JWT>` (per the 3-step login design in `docs/research/architecture.md`). Analytics/Feedback routes below do **not** yet enforce this — see Open Questions.
- Timestamps are ISO 8601 UTC strings, e.g. `2026-07-07T21:22:16.851Z`. Dates-only fields (e.g. `appointmentDate`) are `YYYY-MM-DD`.
- IDs are strings.

### Error shape

Every error response uses this shape:

```json
{ "error": "Human-readable message" }
```

| Status | Meaning |
|---|---|
| 400 | Validation failure (missing/invalid fields) |
| 401 | Missing or invalid auth token |
| 403 | Authenticated but not permitted (role-based) |
| 404 | Resource not found |
| 500 | Unhandled server error |

---

## Auth (proposed — not yet implemented by any module)

Based on the 3-step MFA flow in `docs/research/architecture.md`. Whoever builds this should replace this section with the real contract once implemented.

### `POST /auth/register`
```json
// Request
{ "fullName": "string", "email": "string", "password": "string", "role": "PATIENT" }
// 201 Response
{ "userId": "string", "email": "string", "role": "PATIENT" }
```

### `POST /auth/login`
```json
// Request
{ "email": "string", "password": "string" }
// 200 Response — first factor only, not fully authenticated yet
{ "sessionToken": "string", "nextStep": "SECURITY_QUESTION" }
```

### `POST /auth/verify-question`
```json
// Request
{ "sessionToken": "string", "answer": "string" }
// 200 Response
{ "sessionToken": "string", "nextStep": "CIPHER_CHALLENGE" }
```

### `POST /auth/verify-cipher`
```json
// Request
{ "sessionToken": "string", "answer": "string" }
// 200 Response — fully authenticated
{ "accessToken": "string", "userId": "string", "role": "PATIENT" }
```

**Open questions for the auth owner:** session token expiry (docs say 5 minutes), what `role` values exist (`PATIENT` | `COORDINATOR` — matches `backend/data/users.json`), whether `userId` format matches `user_001` / `coord_001` style already used in analytics sample data.

---

## Appointments (proposed — not yet implemented by any module)

Field names below match `backend/data/appointments.json`, which the Analytics module already depends on — please keep these aligned so analytics doesn't need remapping.

### `GET /appointments`
Query params: `patientId` (optional, coordinators can omit to get all).
```json
// 200 Response
[
  {
    "appointmentId": "apt_001",
    "patientId": "user_001",
    "serviceId": "srv_001",
    "appointmentDate": "2026-06-10",
    "status": "PENDING",
    "createdAt": "2026-06-09T11:00:00Z"
  }
]
```

### `POST /appointments`
```json
// Request
{ "patientId": "string", "serviceId": "string", "appointmentDate": "YYYY-MM-DD" }
// 201 Response — status defaults to PENDING
{ "appointmentId": "string", "patientId": "string", "serviceId": "string", "appointmentDate": "string", "status": "PENDING", "createdAt": "string" }
```

### `PUT /appointments/{id}`
```json
// Request — generic status/field update
{ "status": "CONFIRMED" }
// 200 Response — full updated record
```

### `PUT /appointments/{id}/approve`
```json
// Request: {} (no body needed)
// 200 Response — sets status to CONFIRMED
{ "appointmentId": "string", "status": "CONFIRMED" }
```

**Status enum:** `PENDING | CONFIRMED | COMPLETED | CANCELLED | REJECTED` (matches `backend/data/appointments.json` and `AnalyticsService.getAppointmentStatus()`).

---

## Feedback — **implemented** (`backend/routes/feedback.js`)

### `GET /feedback`
No auth enforced yet. Returns all feedback, newest first, joined with service name.
```json
// 200 Response
[
  {
    "feedbackId": "fb_001",
    "patientId": "user_001",
    "serviceId": "srv_001",
    "appointmentId": "apt_001",
    "rating": 5,
    "comment": "string",
    "submittedAt": "2026-06-10T18:00:00Z",
    "sentimentLabel": "POSITIVE",
    "sentimentScore": { "Positive": 0.7, "Negative": 0.1, "Neutral": 0.15, "Mixed": 0.05 },
    "serviceName": "Mental Wellness Session"
  }
]
```

### `POST /feedback`
```json
// Request
{
  "patientId": "string",
  "serviceId": "string",
  "appointmentId": "string | null (optional)",
  "rating": 1,
  "comment": "string"
}
// 201 Response — same shape as GET item above, sentiment computed server-side
// 400 if patientId, serviceId, rating, or comment missing, or rating not 1-5
```

`sentimentLabel` is one of `POSITIVE | NEGATIVE | NEUTRAL | MIXED`. `sentimentScore` mirrors AWS Comprehend's `DetectSentiment` response shape exactly (`backend/services/sentiment.js`) — currently a local mock, swappable for the real SDK call without changing this contract.

---

## Analytics — **implemented** (`backend/routes/analytics.js`)

All routes are `GET`, no request body. No auth enforced yet (see Open Questions).

### `GET /analytics/kpis`
```json
{
  "totalPatients": 10,
  "todaysLogins": 3,
  "totalAppointments": 20,
  "pendingAppointments": 2,
  "confirmedAppointments": 3,
  "averageRating": 3.91,
  "positiveSentimentPercentage": 72.7
}
```

### `GET /analytics/appointment-trend`
```json
[ { "date": "2026-06-10", "count": 1 } ]
```

### `GET /analytics/appointment-status`
```json
[ { "status": "COMPLETED", "count": 13 } ]
```

### `GET /analytics/popular-services`
```json
[ { "serviceId": "srv_001", "serviceName": "Mental Wellness Session", "count": 8 } ]
```

### `GET /analytics/sentiment-summary`
```json
[ { "label": "POSITIVE", "count": 7 } ]
```
Only labels with `count > 0` are included.

### `GET /analytics/rating-by-service`
```json
[ { "serviceId": "srv_001", "serviceName": "Mental Wellness Session", "averageRating": 4.5 } ]
```

---

## Services — **implemented** (`backend/routes/services.js`)

### `GET /services`
```json
[
  { "serviceId": "srv_001", "serviceName": "Mental Wellness Session", "category": "Wellness", "price": 50.0, "status": "ACTIVE", "createdAt": "2026-05-01T09:00:00Z" }
]
```

---

## Open questions for the team

1. **Auth on analytics/feedback routes.** Right now anyone can call `POST /feedback` or read `/analytics/*` with no token. Per `docs/research/analytics.md` §10 (Privacy Notes), guests/patients/coordinators should see different slices of analytics data. This needs the auth module's JWT shape before it can be enforced — flagging so it isn't forgotten.
2. **Base URL / gateway.** Analytics currently runs as a standalone Express server on `:4000`. If the team converges on API Gateway + Lambda per the Sprint 1 architecture doc, every path above stays the same but the transport changes — this contract describes paths and payloads, not hosting.
3. **`patientId` on feedback submission.** Currently hardcoded client-side to a demo user (`frontend/src/components/FeedbackForm.jsx`) since there's no logged-in session yet. Once auth exists, this should come from the authenticated user, not a form field.
