# Cloud Services Strategy for SAWS

## Reason
We need to figure out the right mix of Backend-as-a-Service (BaaS) and serverless tools for the SmartCare Appointment and Wellness System. The goal is to hit multi-cloud and event-driven design targets without getting drowned in managing servers.

## Setup
* **Handling Users (AWS Cognito):** Cognito is the way to go. It handles OAuth 2.0 right out of the box, and more importantly, it lets us build that custom 3-step MFA flow we need. On top of that, it works and integrates well with API Gateway and Lambda using the JWT tokens.
* **Running Code (AWS Lambda):** Lambda is our glue. It runs backend logic whenever something happens—like a database change, a new queue message, or an authentication step.
* **Storing Data (Amazon DynamoDB):** A NoSQL database is the right choice as it provides sub-millisecond latency and seamless scalability. DynamoDB is perfect for keeping track of user sessions, profile info, and the current status of appointments. Cherry on the cake is that DynamoDB is itself managed and serverless service.
* **Background Messaging (Amazon SQS & SNS):** SQS will hold patient support requests so we don't overwhelm the system and as discussed above it helps in decoupling the architecture along with making it async. Meanwhile, SNS is our broadcasting tool for sending out emails or texts when someone registers, logs in, or books an appointment.
* **Chatbot Brains (Amazon Lex):** Instead of building NLP from scratch, Lex being a managed service excels at what the user wants to do in the chat. It'll connect directly to our Lambda functions to pull info from the database.
* **Understanding Feedback (AWS Comprehend):** Comprehend is a managed service. We just feed in patient text reviews and it automatically figures out if the sentiment is positive or negative. Again, saves us from training our own models.
* **Hosting the UI (AWS Fargate):** We're putting our React app in a container and letting Fargate run it. This way, we don't worry about servers, and it'll scale up if we get a sudden rush of users. However for simplicity we can also place it on AWS S3 if its a static website and serve it via AWS Cloudfront for availability and low latency.

## Multi cloud
* **Dashboards (Google Looker Studio):** For the analytics side, we'll pipe our data logs over to Looker Studio. It's a great way to give Wellness Coordinators a visual breakdown of login stats, popular services, and appointment trends.

## References & Reading
[1] Amazon Web Services, "Amazon Cognito Developer Guide," AWS Documentation. [Online]. Available: https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html. [Accessed: Jun. 11, 2026].
[2] Amazon Web Services, "Fanout Amazon SNS notifications to Amazon SQS," AWS Documentation. [Online]. Available: https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html. [Accessed: Jun. 11, 2026].
[3] Amazon Web Services, "Amazon Lex V2 Developer Guide," AWS Documentation. [Online]. Available: https://docs.aws.amazon.com/lex/latest/dg/what-is.html. [Accessed: Jun. 11, 2026].
[4] Google, "Connect to data - Looker Studio Help," Google Help. [Online]. Available: https://support.google.com/looker-studio/answer/6311467. [Accessed: Jun. 11, 2026].
