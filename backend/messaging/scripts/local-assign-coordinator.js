// Runs the Pub/Sub-triggered assignCoordinator function directly with a fake event, since
// standing up a real Pub/Sub emulator + trigger just to test one handler is overkill for
// local dev. Requires DynamoDB Local (Users table) and the Firestore emulator running -
// see messaging-notifications/README.md.
const { assignCoordinator } = require("../assignCoordinator");

const concern = {
  concernId: process.argv[2] || `concern_local_${Date.now()}`,
  patientId: process.argv[3] || "user_patient_1",
  concernText: process.argv[4] || "I cannot find my appointment reference code.",
  submittedAt: new Date().toISOString(),
};

const fakePubSubEvent = {
  data: Buffer.from(JSON.stringify(concern), "utf8").toString("base64"),
};

assignCoordinator(fakePubSubEvent)
  .then(() => {
    console.log("assignCoordinator ran for:", concern);
  })
  .catch((err) => {
    console.error("assignCoordinator failed:", err);
    process.exit(1);
  });
