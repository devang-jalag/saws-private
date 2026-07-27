import { useEffect, useState } from "react";
import { Grid, Typography, Box, CircularProgress, Alert } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LoginIcon from "@mui/icons-material/Login";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import StarRateIcon from "@mui/icons-material/StarRate";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import KpiCard from "../components/KpiCard";
import ChartCard from "../components/ChartCard";
import AppointmentTrendChart from "../components/charts/AppointmentTrendChart";
import PopularServicesChart from "../components/charts/PopularServicesChart";
import AppointmentStatusChart from "../components/charts/AppointmentStatusChart";
import SentimentDonutChart from "../components/charts/SentimentDonutChart";
import FeedbackTable from "../components/FeedbackTable";
import AnalyticsService from "../services/AnalyticsService";
import FeedbackService from "../services/FeedbackService";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [status, setStatus] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [sentiment, setSentiment] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      AnalyticsService.getKpis(),
      AnalyticsService.getAppointmentTrend(),
      AnalyticsService.getAppointmentStatus(),
      AnalyticsService.getPopularServices(),
      AnalyticsService.getSentimentSummary(),
      FeedbackService.list(),
    ])
      .then(([kpisRes, trendRes, statusRes, popularRes, sentimentRes, feedbackRes]) => {
        if (cancelled) return;
        setKpis(kpisRes);
        setTrend(trendRes);
        setStatus(statusRes);
        setPopularServices(popularRes);
        setSentiment(sentimentRes);
        setFeedback(feedbackRes);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load analytics data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Coordinator Analytics Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard label="Total Patients" value={kpis.totalPatients} icon={<PeopleAltIcon color="primary" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard label="Today's Logins" value={kpis.todaysLogins} icon={<LoginIcon color="primary" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard label="Total Appointments" value={kpis.totalAppointments} icon={<EventAvailableIcon color="primary" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard label="Pending Appointments" value={kpis.pendingAppointments} icon={<HourglassEmptyIcon color="primary" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard label="Average Rating" value={kpis.averageRating} icon={<StarRateIcon color="primary" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard label="Positive Sentiment" value={`${kpis.positiveSentimentPercentage}%`} icon={<ThumbUpAltIcon color="primary" />} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard title="Appointment Trend">
            <AppointmentTrendChart data={trend} />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard title="Feedback Sentiment">
            <SentimentDonutChart data={sentiment} />
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Popular Services" height={340}>
            <PopularServicesChart data={popularServices} />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Appointment Status" height={340}>
            <AppointmentStatusChart data={status} />
          </ChartCard>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
        Feedback Table
      </Typography>
      <FeedbackTable rows={feedback} />
    </Box>
  );
}
