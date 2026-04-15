import { Campaign, DailyStat } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetcher<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) {
        throw new Error(`API 오류: ${res.status} ${endpoint}`);
    }
    return res.json() as Promise<T>;
}

export const api = {
    getCampaigns: () => fetcher<Campaign[]>("/campaigns"),
    getDailyStats: () => fetcher<DailyStat[]>("/daily_stats"),
    postCampaign: async (data: Omit<Campaign, "id">): Promise<Campaign> => {
        const res = await fetch(`${BASE_URL}/campaigns`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("캠페인 등록 실패");
        return res.json();
    },
};
