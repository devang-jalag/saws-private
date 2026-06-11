# Analytics Data Model Research

## 1. Purpose

The analytics module needs clean data from multiple SAWS modules. This document proposes the minimum data structures needed to calculate dashboard metrics and sentiment summaries.

This is a planning document for Sprint 1. The final implementation can use Firestore collections, DynamoDB tables, or a BigQuery analytics dataset depending on the team's selected architecture.

## 2. Design Idea

Operational data and analytics data should be separated logically.

- Operational data is used by the live application.
- Analytics data is used for dashboards, charts, and reports.

Example:

```text
Operational collections/tables:
users, appointments, services, feedback

Analytics/events collections/tables:
user_events, appointment_events, feedback_sentiment, dashboard_summary
```

## 3. Users Collection / Table

Stores basic user profile information.

```json
{
  "userId": "user_123",
  "role": "PATIENT",
  "fullName": "Example Patient",
  "email": "patient@example.com",
  "createdAt": "2026-06-09T10:00:00Z",
  "status": "ACTIVE"
}
```

### Analytics Supported

- Total registered patients
- Number of users by role
- Registration trend over time

## 4. User Events Collection / Table

Stores important user actions such as login success, login failure, and registration.

```json
{
  "eventId": "evt_001",
  "userId": "user_123",
  "role": "PATIENT",
  "eventType": "LOGIN_SUCCESS",
  "timestamp": "2026-06-09T10:30:00Z",
  "source": "COGNITO_OR_CUSTOM_AUTH_FLOW"
}
```

### Possible Event Types

- `REGISTRATION_SUCCESS`
- `LOGIN_SUCCESS`
- `LOGIN_FAILURE`
- `LOGOUT`
- `MFA_STAGE_2_SUCCESS`
- `MFA_STAGE_3_SUCCESS`

### Analytics Supported

- Login statistics
- Failed login trends
- Active user engagement
- Role-based activity

## 5. Services Collection / Table

Stores healthcare and wellness service information.

```json
{
  "serviceId": "srv_001",
  "serviceName": "Mental Wellness Session",
  "category": "Wellness",
  "price": 50.00,
  "status": "ACTIVE",
  "createdAt": "2026-06-09T09:00:00Z"
}
```

### Analytics Supported

- Popular wellness services
- Service category distribution
- Service pricing overview

## 6. Appointments Collection / Table

Stores appointment booking records.

```json
{
  "appointmentId": "apt_001",
  "patientId": "user_123",
  "serviceId": "srv_001",
  "doctorId": "doc_001",
  "appointmentDate": "2026-06-15",
  "appointmentTime": "14:00",
  "status": "CONFIRMED",
  "createdAt": "2026-06-09T11:00:00Z",
  "updatedAt": "2026-06-09T11:10:00Z"
}
```

### Possible Status Values

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `COMPLETED`
- `REJECTED`

### Analytics Supported

- Appointment trends
- Appointment status summary
- Popular service calculation
- Coordinator approval/rejection patterns

## 7. Feedback Collection / Table

Stores structured patient feedback.

```json
{
  "feedbackId": "fb_001",
  "patientId": "user_123",
  "serviceId": "srv_001",
  "appointmentId": "apt_001",
  "rating": 5,
  "comment": "The session was helpful and easy to book.",
  "submittedAt": "2026-06-16T18:00:00Z"
}
```

### Analytics Supported

- Feedback table
- Average rating
- Rating trend
- Feedback count by service

## 8. Feedback Sentiment Collection / Table

Stores sentiment analysis results after the feedback comment is processed.

```json
{
  "sentimentId": "sent_001",
  "feedbackId": "fb_001",
  "serviceId": "srv_001",
  "sentimentLabel": "POSITIVE",
  "sentimentScore": 0.92,
  "sentimentMagnitude": 0.80,
  "processedAt": "2026-06-16T18:01:00Z",
  "provider": "GOOGLE_NATURAL_LANGUAGE_API"
}
```

### Possible Sentiment Labels

- `POSITIVE`
- `NEUTRAL`
- `NEGATIVE`
- `MIXED`

### Analytics Supported

- Sentiment distribution chart
- Negative feedback count
- Service satisfaction comparison
- Feedback quality monitoring

## 9. Dashboard Summary Table / View

A summarized table or BigQuery view can make dashboard queries easier.

Example fields:

```json
{
  "summaryDate": "2026-06-16",
  "totalPatients": 120,
  "dailyLogins": 45,
  "appointmentsCreated": 18,
  "appointmentsConfirmed": 12,
  "appointmentsCancelled": 3,
  "positiveFeedbackCount": 10,
  "neutralFeedbackCount": 2,
  "negativeFeedbackCount": 1
}
```

### Why Summary Data Helps

Dashboards should load quickly. Instead of recalculating everything from raw records every time, the team can create summary views or scheduled queries.

## 10. Privacy Notes

The analytics dashboard must avoid exposing sensitive patient details.

Recommended rules:

- Guests see only public aggregated data.
- Patients see public aggregated data and their own personal information.
- Coordinators see internal analytics but still should not expose unnecessary personal information.
- Feedback comments shown in coordinator tables should avoid displaying unnecessary private health details.

## 11. Minimum Data Needed for Sprint 2 Prototype

For a simple prototype, the team only needs sample records for:

- 5 to 10 users
- 5 services
- 20 appointments
- 10 feedback records
- Sentiment labels for feedback records

This is enough to build charts and show that the analytics design works.
