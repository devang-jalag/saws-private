// Simulates the SNS-to-SQS event shape API Gateway/SQS would hand the subscriber Lambda,
// so it can be exercised without deploying anything.
const { handler } = require("../notifications/subscriber");

const notification = {
  type: process.argv[2] || "BOOKING",
  userId: process.argv[3] || "user_patient_1",
  message: process.argv[4] || "Your appointment is confirmed for tomorrow at 14:00.",
};

const event = {
  Records: [
    {
      body: JSON.stringify({
        Type: "Notification",
        Message: JSON.stringify(notification),
      }),
    },
  ],
};

handler(event)
  .then((result) => console.log("subscriber.handler result:", result))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
