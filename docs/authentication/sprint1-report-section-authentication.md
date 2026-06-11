# Sprint 1 Report Section - Authentication Module

*Draft text for the Sprint 1 group report. Review and trim with the team before submitting; the full report is capped at 4 pages, so this section may need to be shortened to roughly half a page.*

## Module Overview

The User Management and Authentication module controls access to SAWS. It handles registration, a sequential three-stage login, session management, and role-based access for the three user types: guests (no login), registered patients, and wellness coordinators. Every other module depends on a trusted user identity and role from this module, so its design was treated as foundational during Sprint 1 planning.

## Problem Statement and Scope

The module must let patients and coordinators prove their identity through three separate checks before gaining access, while keeping guests limited to public, read-only features. The Sprint 1 scope was to research the required services, design the login flow and data model, and resolve the one undefined requirement (the Caesar-cipher stage), without building the implementation yet.

## Selected Services and Justification

The specification names AWS services for every authentication stage, so the module is pinned to AWS. The proposed stack is Amazon Cognito for the password stage, AWS Lambda and Amazon DynamoDB for the security-question and Caesar-cipher stages, and Amazon API Gateway with a Cognito authorizer for protecting backend calls. Cognito was chosen because it manages the security-critical work (password hashing, token issuance, account protection) and, importantly, supports a custom authentication challenge flow that is purpose-built for chaining extra login steps after the password. A Firebase Auth, Cloud Functions, and Firestore design was documented as the alternative if the team direction changes and the TA approves.

## Proposed Architecture

Login uses Cognito's custom authentication challenge triggers (`DefineAuthChallenge`, `CreateAuthChallenge`, `VerifyAuthChallengeResponse`). Stage 1 verifies the user ID and password natively in Cognito. Stage 2 presents a security question and verifies the answer through Lambda against a hash in DynamoDB. Stage 3 presents a healthcare code clue and verifies a Caesar-cipher response through Lambda against DynamoDB. When all three stages pass, Cognito issues JWT tokens, and role-based access is enforced at API Gateway using Cognito groups or a role attribute. This design means Stages 2 and 3 are genuine "Lambda + DynamoDB" stages as the specification requires, wired into the managed Cognito flow rather than built separately.

## Data Model

User credentials live in the Cognito user pool. A DynamoDB `users` table, keyed by the Cognito user ID, holds the role, the security question and a hash of its answer, the Caesar-cipher base code and shift, basic profile fields, and registration and login timestamps. The timestamps are included so the analytics module can later count registrations and logins without a separate model. Sensitive fields (password, security answer, cipher value) are never stored in plain text.

## Caesar-Cipher Design Decision

Because the specification left the cipher scheme undefined, the module proposes assigning each user a visible base code and a secret shift at registration. At Stage 3 the system shows the base code, the user enters the shifted result, and Lambda recomputes and compares the expected value. Test cases covering the correct answer, case handling, and failure modes were prepared for Sprint 2.

## Integration with Other Modules

This module provides the user ID and role consumed by the messaging, chatbot, and analytics modules, and it hands off to the Notifications module to send registration and login confirmations. Guests are unauthenticated and cannot submit concerns or feedback.

## Sprint 1 Outcome

Sprint 1 produced the requirements list, architecture draft, data model, service justification, a deep-dive on the Cognito custom-challenge flow, and the Caesar-cipher design, all committed to GitLab under `docs/authentication/`. The main technical risk identified is the custom-challenge sequencing logic, which is targeted for an early Sprint 2 prototype with per-stage test cases.