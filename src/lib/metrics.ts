import { safeDivide } from "@/utils/safe";

export const calcCTR = (clicks: number, impressions: number) => safeDivide(clicks, impressions) * 100;

export const calcCPC = (cost: number, clicks: number) => safeDivide(cost, clicks);

export const calcROAS = (conversionsValue: number, cost: number) => safeDivide(conversionsValue, cost) * 100;
