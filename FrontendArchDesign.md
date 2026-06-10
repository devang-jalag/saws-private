# Frontend Architecture Design

## User Roles

1. Guest Users
2. Registered Patients
3. Wellness Coordinators

## Frontend Layer Structure

src/

pages/

* Home
* Login
* Register
* Dashboard
* Appointments
* Feedback
* Admin

components/

* Navbar
* Footer
* Chatbot
* Notification
* AppointmentCard

services/

* AuthService
* AppointmentService
* FeedbackService
* AnalyticsService

context/

* AuthContext
* UserContext
* NotificationContext

## Routing Structure

/
|-- login
|-- register
|-- services
|-- appointments
|-- feedback
|-- dashboard
|-- admin

## Data Flow

User Action
→ React Component
→ API Request
→ AWS Service
→ Response
→ UI Update

## Security

* JWT Authentication
* Role-Based Access Control
* Protected Routes
* HTTPS Communication
