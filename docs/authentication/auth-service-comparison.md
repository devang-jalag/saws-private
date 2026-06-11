# Authentication - service choices and why (Sprint 1)

The spec names AWS services for every login stage, so this module is on AWS. This is the reasoning behind the choices, plus the alternatives we looked at.

## Stage 1 - identity / password

We're using Cognito. We did consider rolling our own (own DB + password hashing) and Firebase Auth on the GCP side. Building our own is the worst option - we'd be responsible for password hashing, tokens, and lockout, which is exactly the security-critical code you don't want to get wrong as students. Firebase Auth is fine but it's the wrong cloud for this module. Cognito wins because it's named in the spec, it handles the hard security parts for us, and it supports the custom challenge flow we need for the extra stages.

## Stages 2 and 3 - the extra checks

These run on Lambda + DynamoDB, which is also what the spec names. The important reason is that the security answer and the cipher secret have to be checked on the server, not in the browser - otherwise anyone could read the answer in the page. Lambda reading DynamoDB keeps the secrets server-side, and it plugs straight into the Cognito challenge flow.

## So the recommended stack is

```text
Stage 1: Cognito (password)
Stage 2: Lambda + DynamoDB (security question)
Stage 3: Lambda + DynamoDB (Caesar cipher)
-> Cognito issues JWTs -> API Gateway authorizer checks token + role
```

Roles via Cognito groups (`patient`, `coordinator`) or a role attribute.

## Why AWS and not GCP for this module

Mostly because the spec names AWS for every stage, and Cognito's custom challenges fit the three-stage requirement almost perfectly. It also keeps the project genuinely multi-cloud - auth and notifications are AWS, messaging is GCP. Firebase Auth + Cloud Functions + Firestore is the equivalent if the team ever switched, but that would need TA sign-off.

Since notifications are also AWS, there's no cross-cloud call inside our module - we just hand off to the AWS notifications module. That keeps the security-sensitive path on one cloud.

## Quick comparison table

| | AWS (recommended) | GCP alternative |
|---|---|---|
| Stage 1 | Cognito | Firebase Auth |
| Stages 2 & 3 | Lambda custom challenges | Cloud Functions |
| Database | DynamoDB | Firestore |

## Docs we looked at

- Cognito Developer Guide - https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html
- Cognito custom auth challenge triggers - https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-challenge.html
- AWS Lambda - https://docs.aws.amazon.com/lambda/latest/dg/welcome.html
- DynamoDB - https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html
- API Gateway + Cognito authorizers - https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html
- (alternative) Firebase Auth - https://firebase.google.com/docs/auth