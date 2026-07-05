// EventBridge scheduled Lambda (e.g. rate(1 hour)). Finds CONFIRMED appointments happening
// tomorrow and publishes a REMINDER notification for each one.
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { doc, TableNames } = require("../shared/dynamo");
const { appointmentsNeedingReminders } = require("./reminderLogic");

// SNS_ENDPOINT lets this point at LocalStack for local runs; unset in deployed environments.
const sns = new SNSClient({
  ...(process.env.SNS_ENDPOINT && { endpoint: process.env.SNS_ENDPOINT }),
});

exports.handler = async () => {
  const { Items } = await doc.send(new ScanCommand({ TableName: TableNames.APPOINTMENTS }));
  const dueTomorrow = appointmentsNeedingReminders(Items || [], new Date());

  for (const appointment of dueTomorrow) {
    await sns.send(
      new PublishCommand({
        TopicArn: process.env.NOTIFICATIONS_TOPIC_ARN,
        Message: JSON.stringify({
          type: "REMINDER",
          userId: appointment.patientId,
          message: `Reminder: you have an appointment tomorrow at ${appointment.appointmentTime}.`,
        }),
      })
    );
  }

  return { remindersSent: dueTomorrow.length };
};
