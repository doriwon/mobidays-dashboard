"use client";

import { useFilteredData } from "@/hooks/useFilteredData";
import { useEffect, useMemo, useState } from "react";
import { Campaign } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { CAMPAIGNS_KEY } from "@/hooks/useCampaigns";

type SortKey = "startDate" | "totalCost" | "ctr" | "cpc" | "roas";
type SortDir = "asc" | "desc";
type Status = Campaign["status"];

const PAGE_SIZE = 10;
const STATUS_LABEL: Record<Status, string> = {
    active: "진행중",
    paused: "일시중지",
    ended: "종료",
};

export default function CampaignTable() {
    const { tableData } = useFilteredData();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkStatus, setBulkStatus] = useState<Status>("active");

    const searchedData = useMemo(() => {
        return tableData.filter((row) => (row.name ?? "").toLowerCase().includes(search.toLowerCase()));
    }, [tableData, search]);

    const sortedData = useMemo(() => {
        if (!sort) return searchedData;

        return [...searchedData].sort((a, b) => {
            const aVal = a[sort.key];
            const bVal = b[sort.key];

            if (typeof aVal === "string" && typeof bVal === "string") {
                return sort.dir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }

            return sort.dir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        });
    }, [searchedData, sort]);

    const totalCount = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const paginatedData = useMemo(() => sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [sortedData, page]);

    // 정렬 토글
    const handleSort = (key: SortKey) => {
        setSort((prev) =>
            prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
        );
        setPage(1);
    };

    // 일괄 상태변경 - React Query 캐시 직접 수정 → 즉시 반영
    const handleBulkChange = () => {
        if (selectedIds.size === 0) return;
        queryClient.setQueryData<Campaign[]>(CAMPAIGNS_KEY, (old = []) =>
            old.map((c) => (selectedIds.has(c.id) ? { ...c, status: bulkStatus } : c)),
        );
        setSelectedIds(new Set());
    };

    // 정렬 아이콘 표시
    const sortIcon = (key: SortKey) => {
        if (sort?.key !== key) return "↕";
        return sort.dir === "asc" ? "↑" : "↓";
    };

    // 검색 시 페이지 초기화
    const handleSearch = (v: string) => {
        setSearch(v);
        setPage(1);
    };

    // 체크박스
    const allChecked = paginatedData.length > 0 && paginatedData.every((r) => selectedIds.has(r.id));

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allChecked) paginatedData.forEach((r) => next.delete(r.id));
            else paginatedData.forEach((r) => next.add(r.id));
            return next;
        });
    };

    const toggleOne = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [totalPages]);

    return (
        <section className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">캠페인 목록</h2>
            <input
                type="text"
                placeholder="캠페인명 검색"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="border px-2 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">
                검색 결과 {totalCount}건 / 전체 {tableData.length}건
            </span>

            {/* 일괄 상태변경 */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{selectedIds.size}개 선택</span>
                <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as Status)}
                    className="rounded border px-2 py-2 text-sm"
                >
                    <option value="active">진행중</option>
                    <option value="paused">일시중지</option>
                    <option value="ended">종료</option>
                </select>
                <button
                    type="button"
                    onClick={handleBulkChange}
                    disabled={selectedIds.size === 0}
                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-40"
                >
                    상태 변경
                </button>
            </div>

            <table className="w-full text-sm">
                <thead>
                    <tr>
                        <th className="pb-2 pr-3">
                            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                        </th>
                        <th className="pb-2 pr-3">캠페인명</th>
                        <th className="pb-2 pr-3">상태</th>
                        <th className="pb-2 pr-3">매체</th>
                        <th
                            className="pb-2 pr-3 cursor-pointer hover:text-blue-600"
                            onClick={() => handleSort("startDate")}
                        >
                            집행기간 {sortIcon("startDate")}
                        </th>
                        <th
                            className="pb-2 pr-3 cursor-pointer hover:text-blue-600"
                            onClick={() => handleSort("totalCost")}
                        >
                            총 집행금액 {sortIcon("totalCost")}
                        </th>
                        <th className="pb-2 pr-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort("ctr")}>
                            CTR(%) {sortIcon("ctr")}
                        </th>
                        <th className="pb-2 pr-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort("cpc")}>
                            CPC(원) {sortIcon("cpc")}
                        </th>
                        <th className="pb-2 pr-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort("roas")}>
                            ROAS(%) {sortIcon("roas")}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={9}>데이터 없음</td>
                        </tr>
                    ) : (
                        paginatedData.map((row) => (
                            <tr key={row.id}>
                                <td className="py-3 pr-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(row.id)}
                                        onChange={() => toggleOne(row.id)}
                                    />
                                </td>
                                <td className="py-3 pr-3">{row.name ?? "-"}</td>
                                <td className="py-3 pr-3"> {STATUS_LABEL[row.status] ?? row.status}</td>
                                <td className="py-3 pr-3">{row.platform}</td>
                                <td className="py-3 pr-3">
                                    {row.startDate} ~ {row.endDate ?? "-"}
                                </td>
                                <td className="py-3 pr-3">{row.totalCost}</td>
                                <td className="py-3 pr-3">{row.ctr}</td>
                                <td className="py-3 pr-3">{row.cpc}</td>
                                <td className="py-3 pr-3">{row.roas}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded border px-3 py-1 text-sm disabled:opacity-40"
                >
                    이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded border px-3 py-1 text-sm ${page === p ? "bg-blue-600 text-white" : ""}`}
                    >
                        {p}
                    </button>
                ))}
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded border px-3 py-1 text-sm disabled:opacity-40"
                >
                    다음
                </button>
            </div>
        </section>
    );
}
