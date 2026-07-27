// Mock stand-in for AWS Comprehend's DetectSentiment API.
// Returns the same response shape as the real SDK call so this module
// can be swapped for `comprehend.detectSentiment({...}).promise()` later
// without changing any calling code.
//
// Real call would look like:
//   const { DetectSentimentCommand } = require("@aws-sdk/client-comprehend");
//   const result = await comprehendClient.send(new DetectSentimentCommand({
//     Text: comment, LanguageCode: "en",
//   }));

const POSITIVE_WORDS = [
  "helpful", "easy", "excellent", "great", "friendly", "smooth", "relaxing",
  "supportive", "professional", "affordable", "good", "love", "loved",
  "amazing", "wonderful", "quick", "organized", "recommend", "happy",
  "satisfied", "pleasant", "efficient",
];

const NEGATIVE_WORDS = [
  "confusing", "delayed", "long", "bad", "poor", "rude", "difficult",
  "slow", "disappointing", "unhelpful", "frustrating", "cancelled",
  "problem", "issue", "worst", "terrible", "annoying", "wait",
];

function detectSentiment(text) {
  const words = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  let positiveHits = 0;
  let negativeHits = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.includes(word)) positiveHits += 1;
    if (NEGATIVE_WORDS.includes(word)) negativeHits += 1;
  }

  let positive = 0.15;
  let negative = 0.15;
  let neutral = 0.6;
  let mixed = 0.1;

  if (positiveHits > 0 || negativeHits > 0) {
    const total = positiveHits + negativeHits;
    positive = 0.1 + (0.8 * positiveHits) / (total + 1);
    negative = 0.1 + (0.8 * negativeHits) / (total + 1);
    neutral = Math.max(0.02, 1 - positive - negative - 0.05);
    mixed = Math.max(0, 1 - positive - negative - neutral);
  }

  const sum = positive + negative + neutral + mixed;
  positive /= sum;
  negative /= sum;
  neutral /= sum;
  mixed /= sum;

  let sentiment = "NEUTRAL";
  if (positiveHits > 0 && negativeHits > 0) {
    sentiment = "MIXED";
  } else if (positive > negative && positive > neutral) {
    sentiment = "POSITIVE";
  } else if (negative > positive && negative > neutral) {
    sentiment = "NEGATIVE";
  }

  return {
    Sentiment: sentiment,
    SentimentScore: {
      Positive: Number(positive.toFixed(4)),
      Negative: Number(negative.toFixed(4)),
      Neutral: Number(neutral.toFixed(4)),
      Mixed: Number(mixed.toFixed(4)),
    },
  };
}

module.exports = { detectSentiment };
