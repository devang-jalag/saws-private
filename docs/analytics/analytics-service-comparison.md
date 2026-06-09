# Analytics Service Comparison and Justification

## 1. Purpose

The project specification allows the analytics dashboard to use either Looker Studio or Amazon QuickSight. It also allows sentiment analysis using either AWS Comprehend or Google Natural Language API.

This document compares the possible choices and explains the recommended option for Sprint 1 planning.

## 2. Dashboard Tool Comparison

| Criteria | Looker Studio | Amazon QuickSight |
|---|---|---|
| Cloud provider | Google | AWS |
| Best fit | BigQuery, Google Sheets, Google Cloud data sources | AWS data sources such as S3, Athena, RDS, Redshift, QuickSight datasets |
| Student project complexity | Easier to create and share basic dashboards | More powerful but embedding and permissions can be more complex |
| Frontend integration | Can be shared or embedded depending on access settings | Supports embedded dashboards and visuals through QuickSight embedding options |
| Data warehouse fit | Strong fit with BigQuery | Strong fit with S3/Athena/Redshift/RDS pipelines |
| Recommended when | Analytics data is stored in Firestore/BigQuery | Analytics data is stored mainly in AWS services |

## 3. Recommended Dashboard Choice

### Recommended: Looker Studio with BigQuery

Looker Studio is recommended for the Sprint 1 analytics plan because it is simple for dashboard creation, easy to connect with BigQuery, and suitable for showing charts such as appointment trends, service popularity, and sentiment summaries.

Suggested flow:

```text
Firestore / application events
        ↓
BigQuery
        ↓
Looker Studio
        ↓
React frontend dashboard page
```

## 4. Why Use Looker Studio?

### Reason 1: Good fit for BigQuery

Looker Studio has a direct BigQuery connector. This makes it easier to visualize analytics tables, views, or custom SQL results from BigQuery.

### Reason 2: Simple for Sprint 1 and student project scope

For Sprint 1, the goal is planning and research. Looker Studio lets the team design dashboard concepts quickly without spending too much time managing BI infrastructure.

### Reason 3: Useful for multi-cloud design

The project is a multi-cloud serverless application. Since other modules may use GCP Pub/Sub, Firestore, or Cloud Functions, Looker Studio and BigQuery keep the analytics part naturally aligned with the GCP side.

### Reason 4: Dashboard requirements are not extremely complex

The required visuals are feedback tables, appointment charts, and service popularity charts. These are standard BI dashboard features and do not require heavy custom analytics engineering.

## 5. Why Not QuickSight as the Primary Option?

QuickSight is still a valid option, but it is not the primary recommendation for Sprint 1 planning.

Reasons:

- It is more AWS-native, so it is strongest when analytics data is already in AWS services such as S3, Athena, or Redshift.
- Dashboard embedding and access permissions may require more setup than the team needs during Sprint 1.
- If the analytics data is stored in Firestore or BigQuery, using QuickSight may add extra cross-cloud movement.

QuickSight should be selected if the team decides that feedback, appointments, and analytics exports will be stored mainly on AWS.

## 6. Sentiment Tool Comparison

| Criteria | Google Natural Language API | AWS Comprehend |
|---|---|---|
| Cloud provider | Google Cloud | AWS |
| Main operation | `documents.analyzeSentiment` | Sentiment detection through Comprehend sentiment APIs |
| Output style | Sentiment score and magnitude | Sentiment label and confidence scores |
| Best fit | Cloud Functions, Firestore, BigQuery, Looker Studio | Lambda, DynamoDB, S3, QuickSight |
| Recommended when | Feedback pipeline is GCP-centered | Feedback pipeline is AWS-centered |

## 7. Recommended Sentiment Choice

### Recommended Primary Option: Google Natural Language API

Google Natural Language API is recommended if the team uses Firestore/BigQuery for analytics because the sentiment result can be stored with the feedback record and visualized easily in Looker Studio.

Suggested flow:

```text
Feedback submitted
        ↓
Cloud Function
        ↓
Google Natural Language API
        ↓
Store sentiment score/label
        ↓
BigQuery and Looker Studio visualization
```

## 8. Why Use Google Natural Language API?

### Reason 1: Aligns with Looker Studio + BigQuery

If Looker Studio and BigQuery are used for dashboards, Google Natural Language API keeps the analytics pipeline on the same cloud side.

### Reason 2: Useful numeric output

The API returns sentiment information that can be converted into positive, neutral, or negative categories and used for charts.

### Reason 3: Serverless-friendly

It can be called from a Cloud Function when a patient submits feedback.

## 9. Why Not AWS Comprehend as the Primary Option?

AWS Comprehend is a strong option and may actually be better if the feedback module is implemented with AWS Lambda and DynamoDB.

It is not the primary recommendation here only because the proposed analytics dashboard is Looker Studio + BigQuery. If the data is already in GCP, using Google Natural Language API avoids unnecessary cross-cloud API calls.

## 10. Final Decision Matrix

| Team Direction | Recommended Dashboard | Recommended Sentiment API |
|---|---|---|
| Firestore + Cloud Functions + BigQuery | Looker Studio | Google Natural Language API |
| DynamoDB + Lambda + S3/Athena | QuickSight | AWS Comprehend |
| Mixed-cloud with GCP analytics | Looker Studio | Google Natural Language API |
| Mixed-cloud with AWS analytics | QuickSight | AWS Comprehend |

## 11. Sprint 1 Recommendation Statement

For Sprint 1, the analytics module should propose **Looker Studio + BigQuery + Google Natural Language API** as the primary analytics design because it is simple, serverless-friendly, suitable for dashboarding, and aligns well with a GCP analytics pipeline. However, the team should keep **QuickSight + AWS Comprehend** as the AWS-native alternative if the final data storage decision becomes DynamoDB/S3/Athena.

## 12. Official Documentation Reviewed

- Looker Studio BigQuery connector: https://docs.cloud.google.com/data-studio/connect-to-google-bigquery
- BigQuery overview: https://docs.cloud.google.com/bigquery/docs/introduction
- QuickSight embedded analytics: https://docs.aws.amazon.com/quick/latest/userguide/embedded-analytics.html
- QuickSight dashboard embedding: https://docs.aws.amazon.com/quick/latest/userguide/embedding-dashboards.html
- Google Natural Language API sentiment analysis: https://docs.cloud.google.com/natural-language/docs/analyzing-sentiment
- AWS Comprehend sentiment analysis: https://docs.aws.amazon.com/comprehend/latest/dg/how-sentiment.html
