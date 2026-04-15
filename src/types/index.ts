export interface Campaign {
    id: string;
    name: string;
    platform: "Google" | "Meta" | "Naver";
    status: "active" | "paused" | "ended";
    budget: number;
    startDate: string;
    endDate: string | null;
}

export interface DailyStat {
    id: string;
    campaignId: string;
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    conversionsValue: number | null;
}
