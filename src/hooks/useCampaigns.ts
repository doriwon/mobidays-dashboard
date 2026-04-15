import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const CAMPAIGNS_KEY = ["campaigns"] as const;

export function useCampaigns() {
    return useQuery({
        queryKey: CAMPAIGNS_KEY,
        queryFn: api.getCampaigns,
    });
}
