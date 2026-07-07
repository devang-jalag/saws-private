import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { sentimentColor, chrome } from "../../theme/palette";

// A 100%-stacked horizontal bar showing sentiment share. Per the dashboard
// wireframe notes, a stacked bar is an accepted alternative to a donut for
// this metric.
export default function SentimentDonutChart({ data }) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const tokens = chrome[mode];
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  const row = { name: "Feedback" };
  data.forEach((d) => {
    row[d.label] = d.count;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[row]}
        layout="vertical"
        margin={{ top: 16, right: 16, left: 16, bottom: 16 }}
      >
        <XAxis type="number" hide domain={[0, total]} />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip
          contentStyle={{
            background: tokens.surface,
            border: `1px solid ${tokens.gridline}`,
            borderRadius: 8,
            color: tokens.textPrimary,
          }}
        />
        {data.map((entry) => (
          <Bar
            key={entry.label}
            dataKey={entry.label}
            name={entry.label}
            stackId="sentiment"
            fill={sentimentColor[entry.label] || tokens.muted}
            barSize={64}
          >
            <LabelList
              dataKey={entry.label}
              position="inside"
              fill="#fff"
              fontSize={12}
              formatter={(value) =>
                value ? `${Math.round((value / total) * 100)}%` : ""
              }
            />
          </Bar>
        ))}
        <Legend
          verticalAlign="bottom"
          wrapperStyle={{ color: tokens.textSecondary, fontSize: 12 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
