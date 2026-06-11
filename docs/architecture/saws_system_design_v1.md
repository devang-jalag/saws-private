# System Architecture Notes

## Handling Messages in the Background
* **The Issue:** When a patient submits a concern, we need to pass that to a random Wellness Coordinator. Meanwhile, the frontend UI should not freeze up while waiting for this routing to happen.
* **Probable solution:** 
  1. The React app sends the request over to API Gateway.
  2. API Gateway drops the message straight into an SQS queue, let's say we'll call it `SupportRequestsQueue`. Now the main goal here is to decouple the architecture which can be done using queues or load balancers. But Queues are better buffers and sort of a memory of tasks which is not possible with load balancers.
  3. A Lambda function constantly checks that queue.
  4. When Lambda grabs a message, it looks at our `Coordinators` table in DynamoDB, picks someone who is active at random, and logs the assignment in the `CommunicationLogs` table.
  5. For the real-time chat feature, use WebSockets through API Gateway for a stateful persistent connection.

## Analytics Pipeline
* **Data Ingestion:** Use DynamoDB Streams to catch any changes happening in our tables, like when a new user joins or an appointment gets booked.
* **Formatting:** A Lambda function triggered by the stream. Its job is to clean up the data and save it into an S3 bucket as something readable, like CSV or JSON.
* **Dashboard:** Lastly, Looker Studio will pull that data from S3 to generate all the charts and stats the admins need to see.

## References
[1] Amazon Web Services, "Change data capture for DynamoDB Streams," AWS Documentation. [Online]. Available: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html. [Accessed: Jun. 11, 2026].
[2] Amazon Web Services, "DetectSentiment - Amazon Comprehend," AWS Documentation. [Online]. Available: https://docs.aws.amazon.com/comprehend/latest/dg/API_DetectSentiment.html. [Accessed: Jun. 11, 2026].
