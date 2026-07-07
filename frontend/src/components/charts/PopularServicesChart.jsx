import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { categorical, chrome } from "../../theme/palette";

export default function PopularServicesChart({ data }) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const tokens = chrome[mode];
  const barColor = categorical.blue[mode];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 24 }}>
        <CartesianGrid vertical={false} stroke={tokens.gridline} />
        <XAxis
          dataKey="serviceName"
          tick={{ fill: tokens.muted, fontSize: 11 }}
          stroke={tokens.baseline}
          tickLine={false}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={70}
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
        <Bar dataKey="count" name="Bookings" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={48}>
          <LabelList dataKey="count" position="top" fill={tokens.textSecondary} fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
