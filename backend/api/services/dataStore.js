const fs = require("fs");
const path = require("path");
const { detectSentiment } = require("./sentiment");

function loadJson(fileName) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const users = loadJson("users.json");
const services = loadJson("services.json");
const appointments = loadJson("appointments.json");
const userEvents = loadJson("userEvents.json");

// Enrich seed feedback with sentiment results on startup so the feedback
// table and sentiment charts have data immediately.
const feedback = loadJson("feedback.json").map((entry) => {
  const result = detectSentiment(entry.comment);
  return {
    ...entry,
    sentimentLabel: result.Sentiment,
    sentimentScore: result.SentimentScore,
  };
});

function addFeedback(entry) {
  feedback.push(entry);
  return entry;
}

function findService(serviceId) {
  return services.find((s) => s.serviceId === serviceId);
}

module.exports = {
  users,
  services,
  appointments,
  userEvents,
  feedback,
  addFeedback,
  findService,
};
