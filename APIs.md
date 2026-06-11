# API Research Notes

## Authentication APIs

POST /register

Purpose:
Register new users

POST /login

Purpose:
Authenticate users through Cognito

POST /verify-question

Purpose:
Second-factor verification

POST /verify-cipher

Purpose:
Third-factor verification

## Appointment APIs

POST /appointments

Purpose:
Create appointment

GET /appointments

Purpose:
Retrieve appointment history

PUT /appointments/{id}

Purpose:
Update appointment status

## Feedback APIs

POST /feedback

Purpose:
Submit service feedback

GET /feedback

Purpose:
Retrieve feedback records

## Analytics APIs

GET /analytics

Purpose:
Retrieve dashboard metrics

## Chatbot APIs

POST /chatbot

Purpose:
Process chatbot requests
