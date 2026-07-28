const functions = require("@google-cloud/functions-framework");
const { Firestore } = require("@google-cloud/firestore");

const firestore = new Firestore();

functions.http("dialogflowWebhook", async (req, res) => {
  try {
    const body = req.body;
    const intentName = body.queryResult?.intent?.displayName || "";
    const session = body.session;

    let fulfillmentText = "I received your request.";

    // Store context in Firestore
    const sessionRef = firestore.collection("chatbot_sessions").doc(encodeURIComponent(session));
    await sessionRef.set({
      lastIntent: intentName,
      lastInteraction: new Date().toISOString()
    }, { merge: true });

    if (intentName === "BookAppointment") {
      fulfillmentText = "Sure, I can help you book an appointment. What time works best for you?";
    } else if (intentName === "CheckStatus") {
      fulfillmentText = "Let me check the status of your appointment...";
    } else {
      fulfillmentText = "I'm not sure how to handle that intent, but your context was saved.";
    }

    res.json({
      fulfillmentText: fulfillmentText
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ fulfillmentText: "Oops, an error occurred on my end." });
  }
});
