# Dashboard Wireframe Notes

## 1. Purpose

This document defines the planned analytics dashboard for SAWS. It helps the team understand what charts, tables, and summary cards should be visible in the frontend.

## 2. Dashboard Users

The dashboard should show different information based on user role.

| User Type | Dashboard Scope |
|---|---|
| Guest | Public and aggregated analytics only |
| Registered Patient | Public analytics plus own appointment/feedback summary |
| Wellness Coordinator | Full operational analytics |

## 3. Coordinator Dashboard Layout

The coordinator dashboard is the most important analytics view because coordinators manage platform activity.

Suggested layout:

```text
+------------------------------------------------------+
| SAWS Coordinator Analytics Dashboard                 |
+------------------------------------------------------+
| Total Patients | Today's Logins | Appointments Today |
+------------------------------------------------------+
| Appointment Trend Line Chart                         |
+------------------------------------------------------+
| Popular Services Bar Chart | Sentiment Donut Chart   |
+------------------------------------------------------+
| Appointment Status Chart | Average Rating by Service |
+------------------------------------------------------+
| Feedback Table                                       |
+------------------------------------------------------+
```

## 4. Dashboard Components

### A. KPI Cards

KPI cards show important numbers quickly.

Recommended cards:

- Total registered patients
- Total appointments
- Pending appointments
- Confirmed appointments
- Today's logins
- Average feedback rating
- Positive sentiment percentage

### B. Appointment Trend Chart

Chart type:

- Line chart
- X-axis: date/week/month
- Y-axis: number of appointments

Purpose:

- Shows whether appointment demand is increasing or decreasing.
- Helps coordinators plan capacity.

### C. Appointment Status Chart

Chart type:

- Bar chart or donut chart

Categories:

- Pending
- Confirmed
- Cancelled
- Completed
- Rejected

Purpose:

- Shows the operational health of appointment processing.
- Helps coordinators identify pending workload.

### D. Popular Services Chart

Chart type:

- Bar chart

X-axis:

- Service name

Y-axis:

- Number of bookings

Purpose:

- Shows which healthcare or wellness services are most demanded.
- Helps coordinators manage schedules and promotional packages.

### E. Sentiment Summary Chart

Chart type:

- Donut chart or stacked bar chart

Categories:

- Positive
- Neutral
- Negative
- Mixed, if supported

Purpose:

- Shows overall patient satisfaction.
- Helps coordinators quickly identify service quality issues.

### F. Feedback Table

Columns:

- Feedback ID
- Service name
- Rating
- Comment preview
- Sentiment label
- Sentiment score
- Submitted date

Purpose:

- Lets coordinators review actual patient feedback.
- Helps identify negative experiences that may need follow-up.

## 5. Guest Dashboard Layout

Guests should only see safe, aggregated information.

Suggested layout:

```text
+-----------------------------------------------+
| Public Service Insights                        |
+-----------------------------------------------+
| Most Popular Services                          |
+-----------------------------------------------+
| Overall Feedback Summary                       |
+-----------------------------------------------+
| General Sentiment Summary                      |
+-----------------------------------------------+
```

Guests should not see:

- Patient names
- Patient emails
- Appointment history
- Internal coordinator performance
- Raw private feedback with personal details

## 6. Patient Dashboard Layout

Patients should see general analytics and their own activity.

Suggested layout:

```text
+-----------------------------------------------+
| My Wellness Activity                           |
+-----------------------------------------------+
| My Appointments | My Feedback Count            |
+-----------------------------------------------+
| My Appointment Status Summary                  |
+-----------------------------------------------+
| Public Service Popularity                      |
+-----------------------------------------------+
| Overall Feedback Sentiment                     |
+-----------------------------------------------+
```

Patients should not see other patients' private information.

## 7. Suggested Dashboard Filters

For the coordinator dashboard:

- Date range
- Service category
- Appointment status
- Sentiment label
- Doctor/specialist

For public dashboards:

- Service category
- Date range, if aggregated

## 8. Sample Chart-to-Data Mapping

| Dashboard Element | Data Source | Aggregation |
|---|---|---|
| Total registered patients | Users | Count users where role = PATIENT |
| Login statistics | UserEvents | Count LOGIN_SUCCESS by date |
| Appointment trend | Appointments | Count appointments by date |
| Popular services | Appointments + Services | Count appointments by service |
| Average rating | Feedback | Average rating by service |
| Sentiment summary | FeedbackSentiment | Count by sentiment label |
| Feedback table | Feedback + Sentiment | Join feedback and sentiment result |

## 9. Sprint 2 Prototype Target

For Sprint 2, the team can create a simple prototype dashboard using sample data.

Minimum prototype visuals:

- Total patients card
- Appointment trend chart
- Popular services chart
- Sentiment summary chart
- Feedback table

This would be enough to prove that the analytics design is working.
