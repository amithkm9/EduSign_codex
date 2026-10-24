"use client";
import { useLocale } from "@/components/i18n/locale-provider";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function QuizTrendChart({
  data,
}: {
  data: { attempt: number; score: number }[];
}) {
  const { t } = useLocale();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="attempt"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip
          contentStyle={{
            borderRadius: "0.5rem",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--popover))",
            fontSize: "0.8rem",
          }}
          formatter={(v: number) => [`${v}%`, t("Résultat")]}
          labelFormatter={(l) => `${t("Essai")} ${l}`}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "hsl(var(--primary))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
