const express = require("express");
const store = require("../services/dataStore");

const router = express.Router();

function isToday(isoString) {
  const today = new Date().toISOString().slice(0, 10);
  return isoString.slice(0, 10) === today;
}

router.get("/kpis", (req, res) => {
  const totalPatients = store.users.filter((u) => u.role === "PATIENT").length;
  const todaysLogins = store.userEvents.filter(
    (e) => e.eventType === "LOGIN_SUCCESS" && isToday(e.timestamp)
  ).length;
  const pendingAppointments = store.appointments.filter(
    (a) => a.status === "PENDING"
  ).length;
  const confirmedAppointments = store.appointments.filter(
    (a) => a.status === "CONFIRMED"
  ).length;
  const totalAppointments = store.appointments.length;

  const avgRating =
    store.feedback.reduce((sum, f) => sum + f.rating, 0) /
    (store.feedback.length || 1);

  const positiveCount = store.feedback.filter(
    (f) => f.sentimentLabel === "POSITIVE"
  ).length;
  const positiveSentimentPercentage =
    (positiveCount / (store.feedback.length || 1)) * 100;

  res.json({
    totalPatients,
    todaysLogins,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    averageRating: Number(avgRating.toFixed(2)),
    positiveSentimentPercentage: Number(positiveSentimentPercentage.toFixed(1)),
  });
});

router.get("/appointment-trend", (req, res) => {
  const counts = {};
  for (const appt of store.appointments) {
    counts[appt.appointmentDate] = (counts[appt.appointmentDate] || 0) + 1;
  }
  const trend = Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  res.json(trend);
});

router.get("/appointment-status", (req, res) => {
  const counts = {};
  for (const appt of store.appointments) {
    counts[appt.status] = (counts[appt.status] || 0) + 1;
  }
  const statuses = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
  }));
  res.json(statuses);
});

router.get("/popular-services", (req, res) => {
  const counts = {};
  for (const appt of store.appointments) {
    counts[appt.serviceId] = (counts[appt.serviceId] || 0) + 1;
  }
  const popular = Object.entries(counts)
    .map(([serviceId, count]) => ({
      serviceId,
      serviceName: store.findService(serviceId)?.serviceName || serviceId,
      count,
    }))
    .sort((a, b) => b.count - a.count);
  res.json(popular);
});

router.get("/sentiment-summary", (req, res) => {
  const counts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, MIXED: 0 };
  for (const f of store.feedback) {
    counts[f.sentimentLabel] = (counts[f.sentimentLabel] || 0) + 1;
  }
  const summary = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([label, count]) => ({ label, count }));
  res.json(summary);
});

router.get("/rating-by-service", (req, res) => {
  const totals = {};
  for (const f of store.feedback) {
    if (!totals[f.serviceId]) totals[f.serviceId] = { sum: 0, count: 0 };
    totals[f.serviceId].sum += f.rating;
    totals[f.serviceId].count += 1;
  }
  const ratings = Object.entries(totals).map(([serviceId, { sum, count }]) => ({
    serviceId,
    serviceName: store.findService(serviceId)?.serviceName || serviceId,
    averageRating: Number((sum / count).toFixed(2)),
  }));
  res.json(ratings);
});

module.exports = router;
