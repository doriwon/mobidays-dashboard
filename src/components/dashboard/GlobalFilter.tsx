"use client";

import { useState, useEffect } from "react";
import { useFilterStore } from "@/store/filterStore";

const PLATFORM_OPTIONS = ["Google", "Meta", "Naver"] as const;
const STATUS_OPTIONS = ["active", "paused", "ended"] as const;

const STATUS_LABEL: Record<(typeof STATUS_OPTIONS)[number], string> = {
    active: "진행중",
    paused: "일시중지",
    ended: "종료",
};

const isValidDate = (str: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    return !isNaN(new Date(str).getTime());
};

// 연도가 4자리 초과인지 체크
const hasInvalidYear = (str: string): boolean => {
    const year = str.split("-")[0];
    return year.length > 4;
};

export default function GlobalFilter() {
    const { dateRange, platforms, statuses, setDateRange, togglePlatform, toggleStatus, resetFilter } =
        useFilterStore();

    const [localStart, setLocalStart] = useState(dateRange.start);
    const [localEnd, setLocalEnd] = useState(dateRange.end);

    useEffect(() => {
        setLocalStart(dateRange.start);
        setLocalEnd(dateRange.end);
    }, [dateRange.start, dateRange.end]);

    const handleDateChange = (value: string, setter: (v: string) => void) => {
        if (!value) return;
        if (hasInvalidYear(value)) return;
        setter(value);
    };

    const handleStartBlur = () => {
        if (isValidDate(localStart)) {
            setDateRange({ start: localStart, end: dateRange.end });
        } else {
            setLocalStart(dateRange.start);
        }
    };

    const handleEndBlur = () => {
        if (isValidDate(localEnd)) {
            setDateRange({ start: dateRange.start, end: localEnd });
        } else {
            setLocalEnd(dateRange.end);
        }
    };

    return (
        <section className="rounded-lg border p-4 space-y-4">
            <div>
                <h2 className="text-lg font-semibold">글로벌 필터</h2>
                <p className="text-sm text-gray-500">필터 변경 시 차트와 테이블이 함께 갱신됩니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <p className="text-sm font-medium">집행 기간</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={localStart}
                            onChange={(e) => handleDateChange(e.target.value, setLocalStart)}
                            onBlur={handleStartBlur}
                            className="rounded border px-3 py-2 text-sm w-full"
                        />
                        <span className="text-sm text-gray-500 flex-shrink-0">~</span>
                        <input
                            type="date"
                            value={localEnd}
                            onChange={(e) => handleDateChange(e.target.value, setLocalEnd)}
                            onBlur={handleEndBlur}
                            className="rounded border px-3 py-2 text-sm w-full"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">상태</p>
                    <div className="flex flex-wrap gap-3">
                        {STATUS_OPTIONS.map((status) => (
                            <label key={status} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={statuses.includes(status)}
                                    onChange={() => toggleStatus(status)}
                                    className="cursor-pointer"
                                />
                                <span>{STATUS_LABEL[status]}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">매체</p>
                    <div className="flex flex-wrap gap-3">
                        {PLATFORM_OPTIONS.map((platform) => (
                            <label key={platform} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={platforms.includes(platform)}
                                    onChange={() => togglePlatform(platform)}
                                    className="cursor-pointer"
                                />
                                <span>{platform}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={resetFilter}
                    className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                >
                    초기화
                </button>
            </div>
        </section>
    );
}
