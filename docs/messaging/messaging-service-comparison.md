# Messaging Service Comparison and Justification

## 1. Purpose

The project specification names GCP Pub/Sub for the message passing module, while the architecture components table lists "SNS/SQS / PubSub" as options. This document compares the possible choices and explains the recommended option for Sprint 1 planning.

## 2. Async Messaging Comparison

| Criteria | GCP Pub/Sub | AWS SNS + SQS |
|---|---|---|
| Cloud provider | Google | AWS |
| Model | Topic → subscription → subscriber | SNS topic fans out → SQS queue → consumer |
| Delivery guarantee | At-least-once, ack deadline, redelivery | At-least-once, visibility timeout, redelivery |
| Failure handling | Dead-letter topic, exponential backoff | Dead-letter queue, redrive policy |
| Serverless trigger | Push subscription → Cloud Function | SQS event source → Lambda |
| Spec alignment | Named directly in module text | Listed in architecture table only |
| Recommended when | Messaging module stays on GCP side | Team consolidates everything on AWS |

Both options are mature, fully managed, and equally capable for the async support flow. The async flow alone does not decide the choice.

## 3. Real-Time Chat Comparison

This is where the two clouds actually differ for this module.

| Criteria | Firestore real-time listeners | AWS AppSync / API Gateway WebSocket |
|---|---|---|
| Setup effort | Very low — attach `onSnapshot` in the client | Medium-high — GraphQL schema or manual WebSocket connection management |
| New concepts for team | None beyond Firestore | GraphQL subscriptions or connection-ID tracking |
| Browser support | Direct from web client SDK | Direct, but more wiring |
| Offline support | Built in | Manual |
| Fit with React | Simple hook around `onSnapshot` | Amplify libraries or custom client |

Firestore gives the chat feature almost for free. On AWS the same feature is a real engineering task.

## 4. Recommended Choice

### Recommended: GCP Pub/Sub + Cloud Functions + Firestore

Suggested flow:

```text
Patient concern
      ↓
Pub/Sub topic (patient-concerns)
      ↓
Cloud Function (random coordinator selection)
      ↓
Firestore communication_logs
      ↓
Notifications module (AWS SNS/SQS) — handoff
```

Real-time chat: Firestore `chats` collection with `onSnapshot` listeners on both clients.

## 5. Why Use GCP for Messaging?

### Reason 1: Direct spec alignment

The module text names "GCP pub/sub" explicitly. Following it avoids any risk of losing marks for substituting a different stack, and matches the course goal of building a genuinely multi-cloud system (auth and notifications are already pinned to AWS).

### Reason 2: Real-time chat is nearly free

Firestore `onSnapshot` listeners push updates to clients over a persistent connection with no polling and no server to manage. The AWS equivalent requires AppSync (GraphQL) or API Gateway WebSockets with manual connection tracking.

### Reason 3: One data layer for the whole module

Concerns, communication logs, coordinator availability, and chat messages all live in Firestore. One set of security rules covers the privacy requirements.

### Reason 4: Built-in reliability

Pub/Sub provides at-least-once delivery, automatic redelivery after the ack deadline, exponential backoff, and dead-letter topics without any custom code.

## 6. Why Not AWS as the Primary Option?

AWS SNS + SQS + Lambda is a strong, standard pattern and would consolidate messaging with the AWS-based notifications module and Cognito auth in one cloud.

It is not the primary recommendation because:

- The module specification names GCP Pub/Sub, so AWS would need TA approval first.
- The real-time chat feature becomes significantly more work (AppSync/GraphQL or WebSocket connection management).
- The project is intentionally multi-cloud; putting everything on AWS works against that design.

AWS should be selected only if the TA confirms it is acceptable and the team decides single-cloud consolidation matters more than chat simplicity.

## 7. Accepted Trade-Off

Because notifications are pinned to AWS SNS/SQS, the GCP messaging design has one cross-cloud call: the Cloud Function publishes a notification request to AWS SNS using the AWS SDK with stored credentials. This is a thin, well-defined integration point, and demonstrating a working cross-cloud call is a positive for a multi-cloud course project.

## 8. Final Decision Matrix

| Team Direction | Async Messaging | Real-Time Chat | Logs |
|---|---|---|---|
| GCP messaging (recommended) | Pub/Sub + Cloud Functions | Firestore onSnapshot | Firestore |
| AWS messaging (needs TA approval) | SNS + SQS + Lambda | AppSync subscriptions | DynamoDB |

## 9. Sprint 1 Recommendation Statement

For Sprint 1, the messaging module should propose **GCP Pub/Sub + Cloud Functions + Firestore** as the primary design because it follows the specification directly, makes the real-time chat feature simple, keeps the module's data in one place, and gives reliability features without custom infrastructure. **AWS SNS/SQS + Lambda + AppSync** remains the documented alternative if the team direction changes and the TA approves.

## 10. Official Documentation Reviewed

- Pub/Sub overview: https://cloud.google.com/pubsub/docs/pubsub-basics
- Pub/Sub subscription types: https://cloud.google.com/pubsub/docs/subscription-overview
- Pub/Sub dead-letter topics: https://cloud.google.com/pubsub/docs/handling-failures
- Trigger Cloud Functions from Pub/Sub: https://cloud.google.com/functions/docs/calling/pubsub
- Firestore real-time listeners: https://firebase.google.com/docs/firestore/query-data/listen
- AWS SNS overview: https://docs.aws.amazon.com/sns/latest/dg/welcome.html
- AWS SQS dead-letter queues: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html
