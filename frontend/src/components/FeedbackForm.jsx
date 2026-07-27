import { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Rating,
  Button,
  Stack,
  Alert,
  Typography,
} from "@mui/material";
import FeedbackService from "../services/FeedbackService";
import { sentimentColor } from "../theme/palette";

const DEMO_PATIENT_ID = "user_001";

export default function FeedbackForm({ services, onSubmitted }) {
  const [serviceId, setServiceId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceId || !rating || !comment.trim()) {
      setError("Please select a service, a rating, and enter a comment.");
      return;
    }
    setError(null);
    setSubmitting(true);
    setResult(null);
    try {
      const saved = await FeedbackService.submit({
        patientId: DEMO_PATIENT_ID,
        serviceId,
        rating,
        comment: comment.trim(),
      });
      setResult(saved);
      setServiceId("");
      setRating(0);
      setComment("");
      onSubmitted?.();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField
          select
          label="Service"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          required
        >
          {services.map((s) => (
            <MenuItem key={s.serviceId} value={s.serviceId}>
              {s.serviceName}
            </MenuItem>
          ))}
        </TextField>

        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            Rating
          </Typography>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
          />
        </Stack>

        <TextField
          label="Comment"
          multiline
          minRows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          required
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? "Analyzing sentiment..." : "Submit Feedback"}
        </Button>

        {result && (
          <Alert
            severity="success"
            sx={{
              borderLeft: `4px solid ${sentimentColor[result.sentimentLabel]}`,
            }}
          >
            Thanks! Sentiment detected: <strong>{result.sentimentLabel}</strong>{" "}
            (confidence{" "}
            {Math.round(
              result.sentimentScore[
                result.sentimentLabel[0] +
                  result.sentimentLabel.slice(1).toLowerCase()
              ] * 100
            )}
            %)
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
