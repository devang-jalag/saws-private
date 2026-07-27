const express = require("express");
const { LexRuntimeV2Client, RecognizeTextCommand } = require("@aws-sdk/client-lex-runtime-v2");

const router = express.Router();

const lexClient = new LexRuntimeV2Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock-secret",
  },
});

router.post("/message", async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    const command = new RecognizeTextCommand({
      botId: process.env.LEX_BOT_ID || "mock-bot-id",
      botAliasId: process.env.LEX_BOT_ALIAS_ID || "mock-alias-id",
      localeId: process.env.LEX_LOCALE_ID || "en_US",
      sessionId: sessionId || "default-user-session",
      text: message,
    });

    const lexResponse = await lexClient.send(command);

    const reply =
      lexResponse.messages && lexResponse.messages.length > 0
        ? lexResponse.messages.map((msg) => msg.content).join(" ")
        : "Sorry, I could not understand your request.";

    res.json({ reply });
  } catch (error) {
    console.error("Lex error:", error);
    res.status(500).json({
      reply: "Chatbot service is currently unavailable.",
    });
  }
});

module.exports = router;
