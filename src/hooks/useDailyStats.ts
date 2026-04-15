import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const DAILY_STATS_KEY = ["daily_stats"] as const;

export function useDailyStats() {
    return useQuery({
        queryKey: DAILY_STATS_KEY,
        queryFn: api.getDailyStats,
    });
}
