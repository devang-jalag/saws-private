const { Firestore } = require("@google-cloud/firestore");

const firestore = new Firestore();
const COMMUNICATION_LOGS = "communication_logs";

module.exports = { firestore, COMMUNICATION_LOGS };
