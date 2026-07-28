const language = require("@google-cloud/language");

// Instantiates a client
const client = new language.LanguageServiceClient();

async function detectSentiment(text) {
  try {
    const document = {
      content: text,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeSentiment({ document: document });
    const sentiment = result.documentSentiment;

    // Convert GCP sentiment score (-1.0 to 1.0) to labels for our app
    let label = "NEUTRAL";
    if (sentiment.score >= 0.25) {
      label = "POSITIVE";
    } else if (sentiment.score <= -0.25) {
      label = "NEGATIVE";
    } else {
      label = "MIXED"; // Can refine based on magnitude
    }

    return {
      Sentiment: label,
      SentimentScore: {
        Score: sentiment.score,
        Magnitude: sentiment.magnitude
      }
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    // Fallback if API fails
    return {
      Sentiment: "NEUTRAL",
      SentimentScore: { Score: 0, Magnitude: 0 }
    };
  }
}

module.exports = { detectSentiment };

