const express = require("express");
const cors = require("cors");
const analyticsRoutes = require("./routes/analytics");
const feedbackRoutes = require("./routes/feedback");
const servicesRoutes = require("./routes/services");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/analytics", analyticsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/services", servicesRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`SAWS Analytics mock API running on http://localhost:${PORT}`);
});
