"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateBR } from "@/lib/utils/date";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; payload?: { name?: string; date?: string } }>;
  label?: string;
};

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-muted">{label}</p>
      <p className="font-semibold text-foreground">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function CategoryPieChart({
  data,
}: {
  data: Array<{ name: string; totalCents: number; color: string }>;
}) {
  if (data.length === 0) {
    return (
      <Card className="flex h-[320px] items-center justify-center">
        <p className="text-sm text-muted">Sem dados no período</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por categoria</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="totalCents"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as { name: string; totalCents: number };
              return (
                <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-xl">
                  <p className="text-muted">{item.name}</p>
                  <p className="font-semibold">{formatCurrency(item.totalCents)}</p>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {data.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-muted">{item.name}</span>
            <span className="ml-auto font-medium">
              {formatCurrency(item.totalCents)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DailyAreaChart({
  data,
}: {
  data: Array<{ date: string; totalCents: number }>;
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatDateBR(d.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução diária</CardTitle>
      </CardHeader>
      {chartData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-muted">Sem movimentação no período</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="totalCents"
              stroke="#10b981"
              fill="url(#areaGreen)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export function BankBarChart({
  data,
}: {
  data: Array<{ name: string; totalCents: number; color: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por banco</CardTitle>
      </CardHeader>
      {data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-muted">Sem dados no período</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as { name: string; totalCents: number };
                return (
                  <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-xl">
                    <p className="text-muted">{item.name}</p>
                    <p className="font-semibold">{formatCurrency(item.totalCents)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="totalCents" radius={[0, 6, 6, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
