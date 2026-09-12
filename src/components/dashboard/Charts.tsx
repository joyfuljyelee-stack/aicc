"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CountItem } from "@/lib/dashboard-stats";

// 카테고리 색 (고정 순서, 색약 검증된 팔레트)
const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];
// 경험 수준(순서가 있는 값)은 한 가지 색의 밝기 단계로
const ORDINAL_BLUE = ["#86b6ef", "#5598e7", "#2a78d6", "#184f95", "#898781"];

const INK = "#0b0b0b";
const MUTED = "#898781";
const GRID = "#e1e0d9";
const AXIS = "#c3c2b7";

type TooltipPayload = { name?: string; value?: number; payload?: { name?: string; label?: string } };

function ChartTooltip({ active, payload, total }: { active?: boolean; payload?: TooltipPayload[]; total?: number }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const name = item.payload?.name ?? item.payload?.label ?? item.name ?? "";
  const value = Number(item.value ?? 0);
  const pct = total ? ` (${Math.round((value / total) * 100)}%)` : "";
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-slate-900">{name}</p>
      <p className="text-slate-600">
        {value}명{pct}
      </p>
    </div>
  );
}

function Legend({ items, colors, total }: { items: CountItem[]; colors: string[]; total: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-1">
      {items.map((item, i) => (
        <li key={item.name} className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: colors[i % colors.length] }} aria-hidden="true" />
          <span className="truncate text-slate-700">{item.name}</span>
          <span className="ml-auto tabular-nums text-slate-500">
            {item.value}
            {total > 0 && <span className="ml-1 text-xs text-slate-400">({Math.round((item.value / total) * 100)}%)</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function EmptyNotice() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="text-sm text-slate-400">아직 신청 데이터가 없습니다</p>
    </div>
  );
}

function sumOf(items: { value: number }[]) {
  return items.reduce((s, i) => s + i.value, 0);
}

/** 도넛 / 파이 공통 */
function RoundChart({ items, inner }: { items: CountItem[]; inner: number }) {
  const total = sumOf(items);
  const data = items.filter((i) => i.value > 0);
  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_180px]">
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={inner}
              outerRadius={95}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={CATEGORICAL[items.findIndex((i) => i.name === entry.name) % CATEGORICAL.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        {total === 0 && (
          <>
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle cx="50%" cy="50%" r="95" fill={inner ? "none" : "#f1f5f9"} stroke="#f1f5f9" strokeWidth={inner ? 95 - inner : 0} />
            </svg>
            <EmptyNotice />
          </>
        )}
        {inner > 0 && total > 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: INK }}>
              {total}
            </span>
            <span className="text-xs text-slate-500">명</span>
          </div>
        )}
      </div>
      <Legend items={items} colors={CATEGORICAL} total={total} />
    </div>
  );
}

export function TeamDonutChart({ items }: { items: CountItem[] }) {
  return <RoundChart items={items} inner={60} />;
}

export function GoalPieChart({ items }: { items: CountItem[] }) {
  return <RoundChart items={items} inner={0} />;
}

export function ExperienceBarChart({ items }: { items: CountItem[] }) {
  const total = sumOf(items);
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="relative" style={{ height: 40 * items.length + 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" allowDecimals={false} domain={[0, max]} tick={{ fill: MUTED, fontSize: 12 }} axisLine={{ stroke: AXIS }} tickLine={false} />
          <YAxis type="category" dataKey="name" width={190} tick={{ fill: INK, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "rgba(11,11,11,0.04)" }} content={<ChartTooltip total={total} />} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
            label={{ position: "right", fill: MUTED, fontSize: 12, formatter: (v: unknown) => (Number(v) > 0 ? `${v}명` : "") }}
          >
            {items.map((entry, i) => (
              <Cell key={entry.name} fill={ORDINAL_BLUE[i % ORDINAL_BLUE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {total === 0 && <EmptyNotice />}
    </div>
  );
}

export function DailyLineChart({ items }: { items: { date: string; label: string; value: number }[] }) {
  const total = sumOf(items);
  return (
    <div className="relative h-60">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={items} margin={{ top: 12, right: 16, bottom: 4, left: -16 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 12 }} axisLine={{ stroke: AXIS }} tickLine={false} />
          <YAxis allowDecimals={false} domain={[0, (max: number) => Math.max(4, max)]} tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CATEGORICAL[0]}
            strokeWidth={2}
            dot={{ r: 4, fill: CATEGORICAL[0], stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {total === 0 && <EmptyNotice />}
    </div>
  );
}
