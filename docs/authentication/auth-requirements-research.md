# Authentication - requirements notes (Sprint 1)

Our module is the login and access-control part of SAWS. It covers sign-up, the multi-stage login, keeping a user signed in, and deciding what each type of user is allowed to do. Pretty much every other module needs a user ID and a role from us before it can do anything, so we treated this as a foundation piece during planning.

## What the spec asks for

The spec is specific about the login: it has to be three stages, in order.

- Stage 1 - user ID and password, using AWS Cognito
- Stage 2 - a security question/answer, using Lambda + DynamoDB
- Stage 3 - a "healthcare code" using a Caesar cipher, using Lambda + DynamoDB

On top of that it wants registration validation, secure login, session management, and role-based access. User details go in DynamoDB. All three stages name AWS services, so unlike the messaging module (which is GCP), auth stays on AWS.

## The three user types

Only patients and coordinators actually log in. Guests don't.

| Role | Logs in? | Can do |
|---|---|---|
| Guest | No | Browse services, use the chatbot, see public feedback |
| Patient | Yes (all 3 stages) | Book appointments, see history, submit concerns/feedback, chat |
| Coordinator | Yes (all 3 stages) | Everything a patient can, plus manage services, approve appointments, see analytics |

The difference between patient and coordinator is the role, not the login steps - both go through the same three stages.

## Main requirements

- User can register, with the sign-up data validated (unique ID, password rules, security question, healthcare code).
- All three stages must pass, in order, before anyone gets in.
- After stage 3, the user gets a session so they don't repeat all three stages on every request.
- A role is attached to each user and checked before coordinator-only actions.
- Registration and login should trigger a notification (handed off to the notifications module).
- Password, security answer, and the cipher value must not be stored as plain text.

## How it connects to the other modules

Messaging and the chatbot need the logged-in user's ID and role from us (guests can't submit concerns). The notifications module is what actually sends the "you registered / you logged in" messages - we just trigger it. Analytics wants our registration and login events to count things like total patients and login stats, so we should record those with timestamps.

## Non-functional stuff

Keep it serverless (Cognito + Lambda + DynamoDB) so there's no auth server to run, and it scales on its own. Don't leak which stage failed in error messages. One patient must never be able to read another patient's record. All three services have free tiers that are fine for our scale.

## What we're handing in for Sprint 1

The requirements (this), an architecture draft, the data model, the service comparison/justification, a short write-up on the Cognito custom-challenge flow, and the Caesar cipher design - all committed under `docs/authentication/`, plus the issue/commit activity on GitLab.