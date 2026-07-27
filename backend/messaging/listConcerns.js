// HTTP Cloud Function: GET /messaging/concerns
const { requireUser } = require("./verifyToken");
const { firestore, COMMUNICATION_LOGS } = require("./firestore");

exports.listConcerns = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use GET." } });

  let user;
  try {
    user = await requireUser(req);
  } catch (err) {
    return res.status(err.statusCode || 401).json({ error: { code: "UNAUTHORIZED", message: "Missing or invalid auth token." } });
  }

  const field = user.role === "COORDINATOR" ? "coordinatorId" : "patientId";
  const snapshot = await firestore.collection(COMMUNICATION_LOGS).where(field, "==", user.userId).get();
  const items = snapshot.docs.map((d) => ({ concernId: d.id, ...d.data() }));

  return res.status(200).json({ items });
};
