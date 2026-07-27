import { Card, CardContent, Typography, Stack } from "@mui/material";

export default function KpiCard({ label, value, icon }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {icon}
          <Stack>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
            >
              {value}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
