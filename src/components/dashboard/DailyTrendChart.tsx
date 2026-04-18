"use client";

import { useFilteredData } from "@/hooks/useFilteredData";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";

type MetricKey = "impressions" | "clicks" | "conversions" | "cost";

const METRICS: { key: MetricKey; label: string; color: string }[] = [
    { key: "impressions", label: "노출수", color: "#6366f1" },
    { key: "clicks", label: "클릭수", color: "#f59e0b" },
    { key: "conversions", label: "전환수", color: "#10b981" },
    { key: "cost", label: "비용", color: "#ef4444" },
];

export default function DailyTrendChart() {
    const { chartData } = useFilteredData();

    // 초기값: 노출수 + 클릭수
    const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(new Set(["impressions", "clicks"]));

    const toggleMetric = (key: MetricKey) => {
        setActiveMetrics((prev) => {
            if (prev.has(key) && prev.size === 1) return prev; // 최소 1개 선택 강제
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    return (
        <section className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-semibold">일별 추이</h2>

                {/* 메트릭 토글 버튼 */}
                <div className="flex gap-2 flex-wrap">
                    {METRICS.map(({ key, label, color }) => {
                        const isActive = activeMetrics.has(key);
                        const isLast = isActive && activeMetrics.size === 1;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleMetric(key)}
                                disabled={isLast}
                                title={isLast ? "최소 1개 이상 선택해야 합니다" : undefined}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all
                  ${isActive ? "text-white" : "bg-white text-gray-500"}
                  ${isLast ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                `}
                                style={isActive ? { backgroundColor: color, borderColor: color } : {}}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                    <CartesianGrid />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {METRICS.filter(({ key }) => activeMetrics.has(key)).map(({ key, label, color }) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={label}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </section>
    );
}
