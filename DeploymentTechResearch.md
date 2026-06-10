# Deployment Technology Research

## Objective

The SAWS application requires a scalable cloud deployment platform capable of supporting serverless services and frontend hosting.

## AWS Fargate

AWS Fargate is a serverless compute engine for containers.

Advantages:

* No server management
* Auto scaling
* Native AWS integration
* Containerized deployment

Disadvantages:

* Slightly higher operational complexity

## Google Cloud Run

Google Cloud Run is a fully managed serverless platform for containerized applications.

Advantages:

* Simple deployment
* Automatic scaling
* Cost-efficient pay-per-use model
* Easy integration with containerized React applications

Disadvantages:

* Less direct integration with AWS-native services

## Selected Deployment Strategy

Frontend:

* React Application
* Docker Container
* Google Cloud Run

Backend:

* AWS Lambda
* AWS Cognito
* AWS DynamoDB
* AWS SNS/SQS
* AWS Lex

## Justification

Using Cloud Run for frontend deployment and AWS for backend services satisfies the multi-cloud requirement while minimizing deployment complexity.

## Conclusion

The selected deployment architecture provides scalability, maintainability, and compliance with project requirements.
