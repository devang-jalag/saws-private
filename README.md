# SmartCare Appointment and Wellness System (SAWS)

## Project Structure

This is a clean, structured monorepo designed to keep frontend, backend APIs, serverless functions, and infrastructure code strictly separated:

```text
/
├── frontend/             # React App (deployed to GCP Cloud Run)
├── backend/              # ALL backend logic
│   ├── api/              # Node.js Express API (Analytics, Chatbot, Feedback - Cloud Run)
│   ├── appointments/     # AWS Lambda (Python) - Appointments, Doctors, Services
│   ├── auth/             # AWS Lambda (Python) - Cognito MFA flow
│   ├── messaging/        # GCP Cloud Functions (Node.js) - Pub/Sub
│   └── notifications/    # AWS Lambda (Node.js) - SNS/SQS
├── terraform/            # Infrastructure as Code
│   ├── modules/          # Reusable Terraform modules
│   │   ├── analytics/
│   │   ├── appointments/
│   │   ├── frontend/
│   │   └── messaging-notifications/
├── docs/                 # API Contracts and Documentation
└── .gitlab-ci.yml        # Unified CI Pipeline
```

## Running Locally

### 1. Unified Backend API
The Express backend serves Analytics, Feedback, and routes Chatbot requests to AWS Lex.

```bash
cd backend/api
npm install
npm run dev
# Server runs on http://localhost:4000
```

### 2. Frontend App
The React application built with Vite and MUI.

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## Features Implemented
- **User Management:** Multi-factor authentication via Cognito and Lambda triggers.
- **Appointments:** REST APIs using Python Lambdas and DynamoDB.
- **Messaging:** Patient-to-Coordinator support tickets via GCP Pub/Sub and Firestore.
- **Notifications:** Booking and reminder events via AWS SNS/SQS.
- **Analytics & Feedback:** Sentiment analysis (Mock Comprehend) and dashboards.
- **Chatbot:** AWS Lex integration for appointment lookups and FAQ.

## Documentation
- [API Contract](./docs/api-contract.md)
- [Messaging README](./docs/messaging-README.md)
- [Messaging API](./docs/messaging-API.md)
