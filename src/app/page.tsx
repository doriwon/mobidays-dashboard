"use client";

import { useCampaigns } from "@/hooks/useCampaigns";
import { useDailyStats } from "@/hooks/useDailyStats";

export default function DashboardPage() {
    const { data: campaigns, isLoading, isError } = useCampaigns();
    const { data: dailyStats } = useDailyStats();

    if (isLoading) return <p>불러오는 중...</p>;
    if (isError) return <p>데이터를 불러올 수 없습니다.</p>;

    return (
        <main>
            <p>캠페인 수: {campaigns?.length}</p>
            <p>일별 데이터 수: {dailyStats?.length}</p>
        </main>
    );
}
