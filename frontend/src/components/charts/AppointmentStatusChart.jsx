import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { appointmentStatusColor, chrome } from "../../theme/palette";

export default function AppointmentStatusChart({ data }) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const tokens = chrome[mode];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={tokens.gridline} />
        <XAxis
          dataKey="status"
          tick={{ fill: tokens.muted, fontSize: 11 }}
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
        <Bar dataKey="count" name="Appointments" radius={[4, 4, 0, 0]} maxBarSize={48}>
          <LabelList dataKey="count" position="top" fill={tokens.textSecondary} fontSize={12} />
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={appointmentStatusColor[entry.status] || tokens.muted}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
