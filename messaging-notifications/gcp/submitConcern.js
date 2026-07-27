// HTTP Cloud Function: POST /messaging/concerns
const { v4: uuidv4 } = require("uuid");
const { PubSub } = require("@google-cloud/pubsub");
const { requireUser } = require("./verifyToken");

const pubsub = new PubSub();
const TOPIC = process.env.CONCERNS_TOPIC || "patient-concerns";

exports.submitConcern = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST." } });

  let user;
  try {
    user = await requireUser(req);
  } catch (err) {
    return res.status(err.statusCode || 401).json({ error: { code: "UNAUTHORIZED", message: "Missing or invalid auth token." } });
  }

  const { concernText } = req.body || {};
  if (!concernText) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "concernText is required." } });
  }

  const concernId = `concern_${uuidv4()}`;
  const message = {
    concernId,
    patientId: user.userId,
    concernText,
    submittedAt: new Date().toISOString(),
  };

  await pubsub.topic(TOPIC).publishMessage({ json: message });

  return res.status(202).json({ concernId, status: "SUBMITTED" });
};
