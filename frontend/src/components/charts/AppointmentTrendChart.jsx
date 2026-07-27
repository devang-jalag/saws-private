import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { categorical, chrome } from "../../theme/palette";

export default function AppointmentTrendChart({ data }) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const tokens = chrome[mode];
  const lineColor = categorical.blue[mode];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke={tokens.gridline}
          strokeWidth={1}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: tokens.muted, fontSize: 12 }}
          stroke={tokens.baseline}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: tokens.muted, fontSize: 12 }}
          stroke={tokens.baseline}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            background: tokens.surface,
            border: `1px solid ${tokens.gridline}`,
            borderRadius: 8,
            color: tokens.textPrimary,
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="Appointments"
          stroke={lineColor}
          strokeWidth={2}
          dot={{ r: 3, fill: lineColor }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
