# SAWS Chatbot Module – Sprint 1 Full Planning Document

## 1. Module Overview

The Virtual Assistant module is one of the core features of the **SmartCare Appointment and Wellness System (SAWS)**. The chatbot's purpose is to provide support and navigation for different user types (e.g., Guests, Registered Patients, and Wellness Coordinators) while improving accessibility and reducing the need for manual assistance in common tasks.

For this module, we have chosen to use **AWS Lex**, **AWS Lambda**, and **Amazon DynamoDB** as the underlying architecture.

---

## 2. Problem Statement

The SAWS platform includes multiple user roles, healthcare and wellness services, appointment management functions, and support workflows. Without a support layer, users may struggle to locate services and features, retrieve appointment details, or submit concerns efficiently.

A chatbot module helps address these challenges by providing a user-friendly interface for:

- Navigation assistance
- Appointment support
- Service inquiries
- Concern submissions
- Frequently Asked Questions (FAQs)

This creates a more intuitive and confusion-free user experience.

---

## 3. Objectives

The primary objective of the chatbot module is to provide an accessible virtual assistant for the SAWS platform that supports user interaction and basic service retrieval.

For the scope of this project, the chatbot is expected to:

- Assist users with application navigation.
- Support appointment lookup using appointment reference codes.
- Provide wellness package inquiry support.
- Accept patient concerns and forward them to wellness coordinators.
- Answer Frequently Asked Questions (FAQs).

---

## 4. Intended Users

### Guests

Guests can use the chatbot for:

- Navigation assistance
- Service information
- General wellness package exploration

Guest functionality is limited compared to registered users.

### Registered Patients

Registered Patients can:

- Navigate the system
- Retrieve appointments using reference codes
- View appointment details
- Submit concerns and support requests for follow-up

### Wellness Coordinators

Wellness Coordinators are primarily responsible for administrative support and can:

- Retrieve appointment details for registered patients

---

