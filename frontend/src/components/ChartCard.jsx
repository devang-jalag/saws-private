import { Card, CardContent, Typography, Box } from "@mui/material";

export default function ChartCard({ title, height = 300, children }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: "100%", height }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
