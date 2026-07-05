// Pub/Sub-triggered Cloud Function, subscribed to the `patient-concerns` topic. Picks a
// random active coordinator from the AWS Users table, logs the assignment in Firestore,
// and hands off to the AWS Notifications module to alert the coordinator.
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { doc, TableNames } = require("./dynamo");
const { firestore, COMMUNICATION_LOGS } = require("./firestore");
const { pickCoordinator } = require("./coordinatorAssignment");

// SNS_ENDPOINT lets this point at LocalStack for local runs; unset in deployed environments.
const sns = new SNSClient({
  ...(process.env.SNS_ENDPOINT && { endpoint: process.env.SNS_ENDPOINT }),
});

exports.assignCoordinator = async (pubSubEvent) => {
  const payload = JSON.parse(Buffer.from(pubSubEvent.data, "base64").toString("utf8"));

  const { Items } = await doc.send(
    new ScanCommand({
      TableName: TableNames.USERS,
      FilterExpression: "#role = :coordinator",
      ExpressionAttributeNames: { "#role": "role" },
      ExpressionAttributeValues: { ":coordinator": "COORDINATOR" },
    })
  );
  const coordinators = (Items || []).map((u) => ({ userId: u.userId, active: u.status !== "INACTIVE" }));
  const coordinator = pickCoordinator(coordinators);

  const now = new Date().toISOString();
  await firestore
    .collection(COMMUNICATION_LOGS)
    .doc(payload.concernId)
    .set({
      patientId: payload.patientId,
      coordinatorId: coordinator ? coordinator.userId : null,
      concernText: payload.concernText,
      responseText: null,
      status: coordinator ? "OPEN" : "UNASSIGNED",
      createdAt: payload.submittedAt,
      assignedAt: coordinator ? now : null,
      respondedAt: null,
    });

  if (coordinator && process.env.NOTIFICATIONS_TOPIC_ARN) {
    await sns.send(
      new PublishCommand({
        TopicArn: process.env.NOTIFICATIONS_TOPIC_ARN,
        Message: JSON.stringify({
          type: "BOOKING",
          userId: coordinator.userId,
          message: `A new patient concern (${payload.concernId}) has been assigned to you.`,
        }),
      })
    );
  }
};
