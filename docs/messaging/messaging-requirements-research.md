# Messaging Requirements Research

## 1. Module Goal

The message passing module lets patients and wellness coordinators communicate inside SAWS. Instead of patients waiting on hold or coordinators answering everything live, the system accepts patient concerns, forwards them to a coordinator automatically, and stores the conversation.

In simple words:

> The messaging module answers: How does a patient ask for help, how does the system decide which coordinator receives it, and how do both sides communicate afterwards.

## 2. Required Features from Project Specification

The SAWS project specification requires the message passing module to support:

- Patients submit support concerns
- Subscriber functions forward requests to a random coordinator
- Communication logs stored in Firestore or DynamoDB
- Support asynchronous communication
- Additional feature: real-time synchronous chat patient → wellness coordinator

The specification names GCP Pub/Sub as the message passing technology.

## 3. Two Different Communication Types

A key planning finding is that the module actually contains two different problems.

| Type | Example | Speed Expectation | Good Technology |
|---|---|---|---|
| Asynchronous | Patient submits a concern, coordinator answers later | Minutes to hours | Pub/Sub queue + serverless function |
| Synchronous (real-time) | Patient and coordinator chat live | Instant | Firestore real-time listeners |

These should not be forced into one technology. Pub/Sub is good for queued, decoupled messages but browsers cannot subscribe to Pub/Sub directly, so it is the wrong tool for live chat.

## 4. Intended Users

### Registered Patients

Patients should be able to:

- Submit a support concern from the app or through the virtual assistant
- Receive a response from a coordinator later (asynchronous)
- See their concern status (open / answered)
- Use real-time chat with a coordinator when needed

### Wellness Coordinators

Coordinators should be able to:

- Receive concerns assigned to them automatically
- View the concern details and patient context
- Respond asynchronously
- Participate in real-time chat with patients

### Guests

Guests do not use the messaging module. They only have the chatbot for navigation help.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| MSG-1 | Patient can submit a support concern | Must |
| MSG-2 | Concern is published to a message queue (Pub/Sub topic) | Must |
| MSG-3 | A subscriber function forwards the concern to one random coordinator | Must |
| MSG-4 | The full exchange is stored as a communication log | Must |
| MSG-5 | Coordinator can respond asynchronously | Must |
| MSG-6 | Patient is notified when a response arrives (handoff to Notifications module) | Must |
| MSG-7 | Patient and coordinator can chat in real time | Additional feature |
| MSG-8 | Failed message deliveries are retried and dead-lettered | Should |

## 6. Connection to Other Modules

### Virtual Assistant Module

The chatbot can accept patient concerns and forward them to coordinators. The simplest design is that the chatbot publishes to the same Pub/Sub topic as the normal concern form, so both entry points share one pipeline.

### Notifications Module

When a coordinator is assigned or responds, the messaging module hands off to the notifications module (AWS SNS/SQS) so the patient and coordinator get alerted. The messaging module itself does not send emails or SMS.

### Authentication Module

Concerns and chats must be linked to a logged-in patient ID and coordinator ID from the auth module. Guests cannot submit concerns.

### Analytics Module

Communication logs can later feed analytics, for example number of concerns per week or average response time. The log data model should include timestamps for this reason.

## 7. Non-Functional Requirements

### Reliability

A patient concern must not be silently lost. The queue should retry failed deliveries and keep undeliverable messages in a dead-letter topic for inspection.

### Privacy

Concerns may contain personal health details. Logs must only be readable by the assigned coordinator and the patient who created them. Other patients must never see them.

### Scalability

The flow should be serverless so the team does not manage messaging servers. Pub/Sub and Cloud Functions scale automatically.

### Cost Awareness

Pub/Sub, Cloud Functions, and Firestore all have free tiers that are enough for a student project at this scale.

## 8. Sprint 1 Deliverables for This Module

- Messaging requirements list (this document)
- Architecture draft with message flow
- Service comparison and justification (GCP vs AWS)
- Communication log data model
- API investigation notes
- GitLab issue updates and commits
