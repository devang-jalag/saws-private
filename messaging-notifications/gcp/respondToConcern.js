// HTTP Cloud Function: PUT /messaging/concerns/{id}/respond
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { requireUser } = require("./verifyToken");
const { firestore, COMMUNICATION_LOGS } = require("./firestore");

// SNS_ENDPOINT lets this point at LocalStack for local runs; unset in deployed environments.
const sns = new SNSClient({
  ...(process.env.SNS_ENDPOINT && { endpoint: process.env.SNS_ENDPOINT }),
});

exports.respondToConcern = async (req, res) => {
  if (req.method !== "PUT") return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use PUT." } });

  let user;
  try {
    user = await requireUser(req);
  } catch (err) {
    return res.status(err.statusCode || 401).json({ error: { code: "UNAUTHORIZED", message: "Missing or invalid auth token." } });
  }
  if (user.role !== "COORDINATOR") {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Only coordinators can respond to concerns." } });
  }

  const concernId = req.params ? req.params.id : req.query.id;
  const { responseText } = req.body || {};
  if (!responseText) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "responseText is required." } });
  }

  const ref = firestore.collection(COMMUNICATION_LOGS).doc(concernId);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "No concern exists with that id." } });
  }
  if (snapshot.data().coordinatorId !== user.userId) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "This concern is assigned to a different coordinator." } });
  }

  const respondedAt = new Date().toISOString();
  await ref.update({ responseText, status: "RESOLVED", respondedAt });
  const updated = { ...snapshot.data(), responseText, status: "RESOLVED", respondedAt, concernId };

  if (process.env.NOTIFICATIONS_TOPIC_ARN) {
    await sns.send(
      new PublishCommand({
        TopicArn: process.env.NOTIFICATIONS_TOPIC_ARN,
        Message: JSON.stringify({
          type: "BOOKING",
          userId: updated.patientId,
          message: `A wellness coordinator responded to your concern: ${responseText}`,
        }),
      })
    );
  }

  return res.status(200).json(updated);
};
