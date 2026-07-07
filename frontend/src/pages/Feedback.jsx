import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Grid, CircularProgress, Alert } from "@mui/material";
import FeedbackForm from "../components/FeedbackForm";
import FeedbackTable from "../components/FeedbackTable";
import AnalyticsService from "../services/AnalyticsService";
import FeedbackService from "../services/FeedbackService";

export default function Feedback() {
  const [services, setServices] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFeedback = useCallback(() => {
    return FeedbackService.list().then(setFeedback);
  }, []);

  useEffect(() => {
    Promise.all([AnalyticsService.getServices(), loadFeedback()])
      .then(([servicesRes]) => setServices(servicesRes))
      .catch((err) => setError(err.message || "Failed to load feedback data."))
      .finally(() => setLoading(false));
  }, [loadFeedback]);

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
        Patient Feedback
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Submit Feedback
          </Typography>
          <FeedbackForm services={services} onSubmitted={loadFeedback} />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Recent Feedback
          </Typography>
          <FeedbackTable rows={feedback} />
        </Grid>
      </Grid>
    </Box>
  );
}
