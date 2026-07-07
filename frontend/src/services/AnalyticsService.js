import api from "./api";

const AnalyticsService = {
  getKpis: () => api.get("/analytics/kpis").then((res) => res.data),
  getAppointmentTrend: () =>
    api.get("/analytics/appointment-trend").then((res) => res.data),
  getAppointmentStatus: () =>
    api.get("/analytics/appointment-status").then((res) => res.data),
  getPopularServices: () =>
    api.get("/analytics/popular-services").then((res) => res.data),
  getSentimentSummary: () =>
    api.get("/analytics/sentiment-summary").then((res) => res.data),
  getRatingByService: () =>
    api.get("/analytics/rating-by-service").then((res) => res.data),
  getServices: () => api.get("/services").then((res) => res.data),
};

export default AnalyticsService;
