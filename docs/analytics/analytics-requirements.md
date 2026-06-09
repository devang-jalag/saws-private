# Analytics Requirements Research

## 1. Module Goal

The analytics module helps SAWS convert application data into meaningful insights. Instead of only storing users, appointments, services, and feedback, the system should summarize this data so users and coordinators can understand platform activity.

In simple words:

> The analytics module answers: How many people are using the system, which services are popular, how appointments are changing over time, and whether patients are happy with the service.

## 2. Required Analytics from Project Specification

The SAWS project specification requires the analytics and visualization module to support:

- Total registered patients
- Login statistics
- Appointment trends
- Popular wellness services
- Feedback table
- Charts for appointment statistics
- Service popularity visualization
- Feedback sentiment analysis
- Sentiment results displayed in the frontend

## 3. Intended Users

### Guest Users

Guests should see general, non-sensitive analytics only.

Examples:

- Overall feedback summary
- General sentiment summary
- Popular public wellness services
- Public service ratings

Guests must not see private patient information, appointment history, or internal coordinator metrics.

### Registered Patients

Patients should see general analytics and their own personal activity.

Examples:

- Their own appointment history summary
- Their own feedback submissions
- General service popularity
- General sentiment score for services

Patients must not see other patients' private data.

### Wellness Coordinators

Coordinators should see operational analytics because they manage the platform.

Examples:

- Total registered patients
- Login activity
- Appointment trend by date
- Appointment status counts
- Popular doctors or services
- Feedback table
- Sentiment distribution
- Ratings by service

## 4. Key Metrics

| Metric | Meaning | Why It Matters | User Visibility |
|---|---|---|---|
| Total registered patients | Count of users with patient role | Shows platform adoption | Coordinator |
| Daily/weekly login count | Number of successful logins over time | Shows user engagement | Coordinator |
| Appointment trend | Number of appointments by date/week/month | Helps coordinators prepare capacity | Coordinator |
| Appointment status count | Pending, confirmed, cancelled, completed | Helps track workflow health | Coordinator |
| Popular wellness services | Services with the highest booking count | Helps improve service planning | All users, aggregated only |
| Average rating | Average patient score from feedback | Shows service satisfaction | All users, aggregated only |
| Sentiment distribution | Positive, neutral, negative feedback counts | Shows patient experience quickly | All users, aggregated only |
| Feedback table | List of feedback with sentiment results | Helps coordinators review issues | Coordinator |

## 5. Data Needed from Other Modules

### Authentication Module

Data needed:

- User ID
- Role: guest, patient, coordinator
- Registration timestamp
- Login timestamp
- Login success/failure status

Analytics supported:

- Total registered patients
- Login statistics
- Role-based usage

### Appointment Module

Data needed:

- Appointment ID
- Patient ID
- Service ID
- Doctor/specialist ID
- Appointment date and time
- Appointment status
- Created timestamp

Analytics supported:

- Appointment trends
- Appointment status charts
- Peak booking periods
- Popular services

### Service Management Module

Data needed:

- Service ID
- Service name
- Service category
- Price
- Availability status

Analytics supported:

- Popular wellness services
- Service category demand
- Service price overview

### Feedback Module

Data needed:

- Feedback ID
- Patient ID
- Service ID
- Rating
- Comment
- Submitted timestamp
- Sentiment label
- Sentiment score

Analytics supported:

- Feedback table
- Sentiment summary
- Average rating
- Negative feedback detection

## 6. Analytics Requirements for Sprint 1

Sprint 1 does not require full implementation. For this module, Sprint 1 should produce:

- Analytics requirements list
- Proposed data model
- Initial dashboard layout
- Cloud service comparison
- Sentiment API research
- Initial architecture draft
- GitLab work item updates and commits

## 7. Non-Functional Requirements

### Privacy

Patient-specific data must not be shown to guests or other patients. Public dashboards should use aggregated data only.

### Security

Analytics API endpoints should use role-based access control. Coordinators can access internal analytics. Guests and patients should access only public or personal analytics.

### Scalability

The analytics pipeline should be serverless so the team does not manage analytics servers manually.

### Maintainability

Analytics data should be stored in a structured format so dashboards can be extended later.

### Cost Awareness

Because this is a student project, the design should avoid unnecessary paid or complex enterprise features where a simpler dashboard can satisfy the requirement.
