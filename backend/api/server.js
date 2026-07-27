require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analyticsRoutes = require("./routes/analytics");
const feedbackRoutes = require("./routes/feedback");
const servicesRoutes = require("./routes/services");
const chatbotRoutes = require("./routes/chatbot");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`SAWS backend API running on http://localhost:${PORT}`);
});
