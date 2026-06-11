# Authentication - data model notes (Sprint 1)

The idea is to split credentials from everything else. Cognito owns the password - we never see it or store it. Everything our own Lambdas need for stages 2 and 3 goes in a DynamoDB users table.

## What Cognito holds (stage 1)

The user ID and password (hashed and managed by Cognito), email, and group membership for the role. We don't model this ourselves; it's the managed half.

## The users table in DynamoDB

One item per user, keyed by the Cognito user ID. This is what the stage 2 and 3 Lambdas read.

```json
{
  "userId": "sub_abc123",
  "role": "PATIENT",
  "fullName": "Example Patient",
  "email": "patient@example.com",
  "securityQuestion": "What is your favourite clinic?",
  "securityAnswerHash": "<sha256 of the lowercased answer>",
  "cipherBaseCode": "HEALTH",
  "cipherShift": 3,
  "createdAt": "2026-06-10T14:30:00Z",
  "lastLoginAt": null
}
```

Why these fields: `role` drives access control. `securityQuestion` is shown at stage 2 and the answer is checked against `securityAnswerHash` (we store the hash, never the plain answer). `cipherBaseCode` is the clue shown at stage 3 and `cipherShift` is the user's secret. The two timestamps are there so analytics can count registrations and logins later without us building a separate thing.

Roles are just `PATIENT` or `COORDINATOR`. Guests aren't in this table because they don't register.

## Storing the cipher secret

Two options, and we should pick one:

- Store the shift (recommended) - recompute the expected code at login and compare. Simple.
- Store only a hash of the expected code and drop the shift - a bit more secure but less flexible.

Going with storing the shift for now unless the team wants otherwise.

## Sessions

We probably don't need a sessions table. Cognito's tokens already prove an active session until they expire. We'd only add a sessions table if we wanted to force-log-out users or keep an audit log of logins - decide later.

## Privacy

A user should only read their own record; a coordinator only when there's an actual admin reason. The security answer hash and cipher fields are never read by any client - only the Lambdas touch them, and those run with least-privilege IAM.

## Sample data for the Sprint 2 prototype

2 patients (different questions and shifts) and 1 coordinator is enough to demo registration, all three login stages, a role-gated coordinator action, and a failed login.