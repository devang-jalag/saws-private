// SQS-triggered Lambda, subscribed to the SNS notifications topic. Fans every
// registration/login/booking/cancellation/reminder event out into the Notifications
// table so GET /notifications/me can list a user's history.
const { v4: uuidv4 } = require("uuid");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TableNames } = require("../shared/dynamo");

function parseNotification(record) {
  const envelope = JSON.parse(record.body);
  // SNS-to-SQS wraps the published message inside envelope.Message.
  const payload = envelope.Message ? JSON.parse(envelope.Message) : envelope;
  return payload;
}

exports.handler = async (event) => {
  for (const record of event.Records) {
    const { type, userId, message } = parseNotification(record);
    await doc.send(
      new PutCommand({
        TableName: TableNames.NOTIFICATIONS,
        Item: {
          notificationId: `ntf_${uuidv4()}`,
          userId,
          type,
          message,
          createdAt: new Date().toISOString(),
        },
      })
    );
  }
  return { batchItemFailures: [] };
};

module.exports.parseNotification = parseNotification;
