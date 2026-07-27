const express = require("express");
const dialogflow = require("@google-cloud/dialogflow");

const router = express.Router();

// The GOOGLE_APPLICATION_CREDENTIALS environment variable should be set in the environment
// pointing to the GCP Service Account JSON key.
const sessionClient = new dialogflow.SessionsClient();

router.post("/message", async (req, res) => {
  const { message, sessionId } = req.body;
  const projectId = process.env.GCP_PROJECT_ID || "saws-lambda-legends-503718";
  
  const currentSessionId = sessionId || "default-user-session";
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, currentSessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: "en-US",
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    const reply = result.fulfillmentText || "Sorry, I could not understand your request.";

    res.json({ reply });
  } catch (error) {
    console.error("Dialogflow error:", error);
    res.status(500).json({
      reply: "Chatbot service is currently unavailable.",
    });
  }
});

module.exports = router;
