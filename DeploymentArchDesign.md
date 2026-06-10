# Deployment Architecture Design

## High-Level Architecture

React Frontend
↓
Google Cloud Run
↓
AWS API Gateway
↓
AWS Lambda
↓
AWS Services

## Backend Services

Authentication:

* AWS Cognito

Database:

* AWS DynamoDB

Business Logic:

* AWS Lambda

Chatbot:

* AWS Lex

Notifications:

* SNS
* SQS

Analytics:

* QuickSight

Messaging:

* GCP Pub/Sub

## Deployment Flow

Developer
→ GitLab Repository
→ GitLab CI/CD
→ Docker Build
→ Cloud Run Deployment

## Benefits

* High scalability
* Fault tolerance
* Serverless operation
* Reduced operational costs
