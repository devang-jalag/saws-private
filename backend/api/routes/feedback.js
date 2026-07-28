const express = require("express");
const store = require("../services/dataStore");
const { detectSentiment } = require("../services/sentiment");

const router = express.Router();

router.get("/", (req, res) => {
  const table = [...store.feedback]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map((f) => ({
      ...f,
      serviceName: store.findService(f.serviceId)?.serviceName || f.serviceId,
    }));
  res.json(table);
});

router.post("/", async (req, res) => {
  const { patientId, serviceId, appointmentId, rating, comment } = req.body;

  if (!patientId || !serviceId || !rating || !comment) {
    return res.status(400).json({
      error: "patientId, serviceId, rating, and comment are required",
    });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be between 1 and 5" });
  }

  const sentimentResult = await detectSentiment(comment);

  const entry = {
    feedbackId: `fb_${Date.now()}`,
    patientId,
    serviceId,
    appointmentId: appointmentId || null,
    rating: Number(rating),
    comment,
    submittedAt: new Date().toISOString(),
    sentimentLabel: sentimentResult.Sentiment,
    sentimentScore: sentimentResult.SentimentScore.Score,
  };

  store.addFeedback(entry);

  try {
    const { BigQuery } = require("@google-cloud/bigquery");
    const bigquery = new BigQuery();
    
    // Check if GCP project and BQ are configured in env, if not just skip BigQuery insert
    if (process.env.GCP_PROJECT_ID) {
      await bigquery
        .dataset("saws_analytics_dev")
        .table("feedback_sentiment")
        .insert([entry]);
      console.log(`Inserted feedback ${entry.feedbackId} into BigQuery`);
    }
  } catch (error) {
    console.error("Failed to insert into BigQuery:", error);
    // Continue anyway so the user request doesn't fail if BQ isn't deployed yet
  }

  res.status(201).json({
    ...entry,
    serviceName: store.findService(serviceId)?.serviceName || serviceId,
  });
});

module.exports = router;
