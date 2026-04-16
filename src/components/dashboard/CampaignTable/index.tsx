"use client";

import { useFilteredData } from "@/hooks/useFilteredData";

export default function CampaignTable() {
    const { tableData } = useFilteredData();

    return (
        <section className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">캠페인 목록</h2>

            <table className="w-full text-sm">
                <thead>
                    <tr>
                        <th>캠페인명</th>
                        <th>상태</th>
                        <th>매체</th>
                        <th>집행기간</th>
                        <th>비용</th>
                        <th>CTR</th>
                        <th>CPC</th>
                        <th>ROAS</th>
                    </tr>
                </thead>

                <tbody>
                    {tableData.length === 0 ? (
                        <tr>
                            <td colSpan={8}>데이터 없음</td>
                        </tr>
                    ) : (
                        tableData.map((row) => (
                            <tr key={row.id}>
                                <td>{row.name ?? "-"}</td>
                                <td>{row.status}</td>
                                <td>{row.platform}</td>
                                <td>
                                    {row.startDate} ~ {row.endDate ?? "-"}
                                </td>
                                <td>{row.totalCost}</td>
                                <td>{row.ctr}</td>
                                <td>{row.cpc}</td>
                                <td>{row.roas}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </section>
    );
}
