import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Rating,
  Typography,
} from "@mui/material";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { sentimentColor } from "../theme/palette";

const SENTIMENT_ICON = {
  POSITIVE: SentimentSatisfiedAltIcon,
  NEUTRAL: SentimentNeutralIcon,
  NEGATIVE: SentimentVeryDissatisfiedIcon,
  MIXED: SentimentDissatisfiedIcon,
};

function SentimentChip({ label }) {
  const Icon = SENTIMENT_ICON[label] || SentimentNeutralIcon;
  const color = sentimentColor[label];
  return (
    <Chip
      icon={<Icon sx={{ color: `${color} !important` }} />}
      label={label}
      size="small"
      variant="outlined"
      sx={{ borderColor: color, color }}
    />
  );
}

export default function FeedbackTable({ rows }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Service</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Comment</TableCell>
            <TableCell>Sentiment</TableCell>
            <TableCell>Submitted</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.feedbackId} hover>
              <TableCell>{row.serviceName}</TableCell>
              <TableCell>
                <Rating value={row.rating} size="small" readOnly />
              </TableCell>
              <TableCell sx={{ maxWidth: 320 }}>
                <Typography variant="body2" noWrap title={row.comment}>
                  {row.comment}
                </Typography>
              </TableCell>
              <TableCell>
                <SentimentChip label={row.sentimentLabel} />
              </TableCell>
              <TableCell>
                {new Date(row.submittedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
