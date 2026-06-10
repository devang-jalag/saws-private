# SAWS Authentication Research - Sprint 1

**Project:** SmartCare Appointment and Wellness System (SAWS)  
**Course:** CSCI 5410/S26  
**Sprint:** Sprint 1 - Planning Phase  
**Module:** User Management and Authentication  
**Prepared for:** Authentication Research Work Item

## Purpose

This folder contains Sprint 1 research and planning notes for the SAWS authentication module. The goal of this module is to control who can enter the system and what they are allowed to do, using a sequential three-stage login and role-based access.

The project specification requires this module to support registration validation, a three-stage multi-factor login (password, security question, Caesar-cipher healthcare code), session management, and role-based access for guests, registered patients, and wellness coordinators. This Sprint 1 work focuses on planning the architecture, data model, service choices, and the custom login flow before implementation begins.

## Documents Included

| File | Purpose |
|---|---|
| `auth-requirements-research.md` | Defines what the authentication module must do and which data each stage needs. |
| `auth-service-comparison.md` | Compares Cognito vs custom auth vs Firebase, and justifies the AWS choice. |
| `auth-data-model.md` | Proposes the Cognito attributes and the DynamoDB `users` table. |
| `auth-architecture-draft.md` | Shows the registration flow, the 3-stage login, and the serverless architecture. |
| `cognito-custom-auth-flow-research.md` | Deep dive on the Cognito custom-challenge Lambda triggers that chain the three stages. |
| `caesar-cipher-design.md` | Proposes the concrete Caesar-cipher scheme for Stage 3 (the one open design decision). |
| `sprint1-report-section-authentication.md` | Draft text for the Sprint 1 group report after team review. |
| `gitlab-work-item-description.md` | Suggested GitLab issue description for the Authentication Research work item. |

## Recommended Sprint 1 Decision

For Sprint 1 planning, the recommended authentication stack is:

```text
React frontend
        -> sign in
Amazon Cognito user pool (Stage 1: user ID + password)
        -> custom auth challenge Lambda triggers
Stage 2: Lambda + DynamoDB (security question / answer)
Stage 3: Lambda + DynamoDB (Caesar-cipher healthcare code)
        -> all stages pass
Cognito issues JWT tokens (ID / access / refresh)
        -> API Gateway Cognito authorizer enforces role on every protected call
```

The three login stages are chained using Cognito's custom authentication challenge triggers (`DefineAuthChallenge`, `CreateAuthChallenge`, `VerifyAuthChallengeResponse`), so Stages 2 and 3 plug into Cognito as the "Lambda + DynamoDB" the specification names, rather than being a separate hand-built system.

This module is pinned to AWS because the specification names AWS services for every stage. A Firebase Auth + Cloud Functions + Firestore design is documented as the alternative if the team direction changes and the TA approves.

## Official Documentation Reviewed

- Amazon Cognito Developer Guide: https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html
- Cognito custom authentication challenge Lambda triggers: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-challenge.html
- Cognito user pool Lambda trigger reference: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html
- AWS Lambda Developer Guide: https://docs.aws.amazon.com/lambda/latest/dg/welcome.html
- Amazon DynamoDB Developer Guide: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html
- Amazon API Gateway + Cognito authorizers: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html
- (Alternative) Firebase Authentication: https://firebase.google.com/docs/auth