# SAWS Analytics Research - Sprint 1

**Project:** SmartCare Appointment and Wellness System (SAWS)  
**Course:** CSCI 5410/S26  
**Sprint:** Sprint 1 - Planning Phase  
**Module:** Data Analysis and Visualization  
**Prepared for:** Analytics Research Work Item

## Purpose

This folder contains Sprint 1 research and planning notes for the SAWS analytics module. The goal of this module is to convert raw system activity into useful insights for patients, guest users, and wellness coordinators.

The project specification requires the analytics module to support platform usage analytics, patient engagement monitoring, feedback analysis, sentiment analysis, and dashboard visualizations. This Sprint 1 work focuses on planning the data requirements, dashboard design, service choices, and integration approach before implementation begins.

## Documents Included

| File | Purpose |
|---|---|
| `analytics-requirements.md` | Defines what the analytics module must show and which data is needed. |
| `analytics-service-comparison.md` | Compares Looker Studio vs QuickSight and AWS Comprehend vs Google Natural Language API. |
| `analytics-data-model.md` | Proposes collections/tables needed for analytics. |
| `analytics-architecture-draft.md` | Shows the proposed analytics pipeline and serverless architecture. |
| `sentiment-api-research.md` | Explains how feedback sentiment analysis will work. |
| `dashboard-wireframe-notes.md` | Describes dashboard cards, charts, and tables. |
| `sprint1-report-section-analytics.md` | Draft text that can be used in the Sprint 1 group report after team review. |
| `gitlab-work-item-description.md` | Suggested GitLab issue description for the Analytics Research work item. |

## Recommended Sprint 1 Decision

For Sprint 1 planning, the recommended analytics stack is:

```text
Firestore / application event data
        ↓
BigQuery analytics store
        ↓
Looker Studio dashboard
        ↓
React frontend embeds or links dashboard views
```

For sentiment analysis, the recommended primary option is:

```text
Patient feedback form
        ↓
Cloud Function or Lambda
        ↓
Google Natural Language API OR AWS Comprehend
        ↓
Store sentiment result with feedback record
        ↓
Show sentiment summary in frontend/dashboard
```

The final selection should match the team's actual storage and backend choices. If most feedback data is stored in Firestore, Google Natural Language API and Looker Studio are easier to connect. If most feedback data is stored in DynamoDB and AWS Lambda, AWS Comprehend and QuickSight are more AWS-native.

## Official Documentation Reviewed

- Amazon QuickSight embedded analytics: https://docs.aws.amazon.com/quick/latest/userguide/embedded-analytics.html
- Amazon QuickSight dashboard embedding: https://docs.aws.amazon.com/quick/latest/userguide/embedding-dashboards.html
- Amazon Comprehend sentiment analysis: https://docs.aws.amazon.com/comprehend/latest/dg/how-sentiment.html
- Google Looker Studio BigQuery connector: https://docs.cloud.google.com/data-studio/connect-to-google-bigquery
- Google Cloud Natural Language API sentiment analysis: https://docs.cloud.google.com/natural-language/docs/analyzing-sentiment
- Google Natural Language API `documents.analyzeSentiment`: https://docs.cloud.google.com/natural-language/docs/reference/rest/v1/documents/analyzeSentiment
- Firestore to BigQuery integration: https://firebase.google.com/docs/firestore/solutions/bigquery
- Stream Firestore to BigQuery extension: https://extensions.dev/extensions/firebase/firestore-bigquery-export
- BigQuery overview: https://docs.cloud.google.com/bigquery/docs/introduction
- DynamoDB export to S3: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html
