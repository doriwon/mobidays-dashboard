"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CAMPAIGNS_KEY } from "@/hooks/useCampaigns";
import { Campaign } from "@/types";

// 날짜 유효성 검사 함수
const isValidDate = (str: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const d = new Date(str);
    return !isNaN(d.getTime());
};

const schema = z
    .object({
        name: z.string().min(2, "2자 이상 입력해주세요").max(100, "100자 이하로 입력해주세요"),
        platform: z.enum(["Google", "Meta", "Naver"], {
            error: "매체를 선택해주세요",
        }),
        budget: z
            .number({ error: "숫자를 입력해주세요" })
            .min(100, "최소 100원 이상이어야 합니다")
            .max(1_000_000_000, "최대 10억 원까지 입력 가능합니다")
            .int("정수를 입력해주세요"),
        cost: z
            .number({ error: "숫자를 입력해주세요" })
            .min(0, "0원 이상이어야 합니다")
            .max(1_000_000_000, "최대 10억 원까지 입력 가능합니다")
            .int("정수를 입력해주세요"),
        startDate: z.string().min(1, "시작일을 입력해주세요").refine(isValidDate, "올바른 날짜를 입력해주세요"),
        endDate: z.string().min(1, "종료일을 입력해주세요").refine(isValidDate, "올바른 날짜를 입력해주세요"),
    })
    .refine((data) => data.cost <= data.budget, {
        message: "집행 금액은 예산을 초과할 수 없습니다",
        path: ["cost"],
    })
    .refine((data) => data.endDate >= data.startDate, {
        message: "종료일은 시작일 이후여야 합니다",
        path: ["endDate"],
    });

type FormValues = z.infer<typeof schema>;
interface Props {
    open: boolean;
    onClose: () => void;
}

export default function CampaignModal({ open, onClose }: Props) {
    const queryClient = useQueryClient();
    const [toast, setToast] = useState<"success" | "error" | null>(null);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    // 모달 오픈 시 스크롤 제어
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const showToast = (type: "success" | "error") => {
        setToast(type);
        setTimeout(() => setToast(null), 3000);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        const newCampaign: Campaign = {
            id: crypto.randomUUID(),
            name: values.name,
            platform: values.platform,
            status: "active",
            budget: values.budget,
            startDate: values.startDate,
            endDate: values.endDate,
        };

        queryClient.setQueryData<Campaign[]>(CAMPAIGNS_KEY, (old = []) => [...old, newCampaign]);
        handleClose();
        showToast("success");
    };

    return (
        <>
            {/* 토스트 */}
            {toast && (
                <div
                    className={` 
                        ${toast === "success" ? "bg-green-500" : "bg-red-500"}
                        fixed bottom-6 right-6 z-[100] rounded-lg px-4 py-3 text-sm text-white shadow-lg transition-all
                    `}
                >
                    {toast === "success" ? "✓ 캠페인이 등록되었습니다." : "✕ 등록에 실패했습니다."}
                </div>
            )}
            {/* 백드롭 */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
                    {/* 모달 본체 - 클릭 이벤트 버블링 차단 */}
                    <div
                        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">캠페인 등록</h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* 캠페인명 */}
                            <Field label="캠페인명" error={errors.name?.message}>
                                <input {...register("name")} placeholder="2자 ~ 100자" className="input" />
                            </Field>

                            {/* 광고 매체 */}
                            <Field label="광고 매체" error={errors.platform?.message}>
                                <select {...register("platform")} className="input">
                                    <option value="">선택해주세요</option>
                                    <option value="Google">Google</option>
                                    <option value="Meta">Meta</option>
                                    <option value="Naver">Naver</option>
                                </select>
                            </Field>

                            {/* 예산 */}
                            <Field label="예산 (원)" error={errors.budget?.message}>
                                <input
                                    {...register("budget", { valueAsNumber: true })}
                                    type="number"
                                    placeholder="100 ~ 1,000,000,000"
                                    className="input"
                                />
                            </Field>

                            {/* 집행 금액 */}
                            <Field label="집행 금액 (원)" error={errors.cost?.message}>
                                <input
                                    {...register("cost", { valueAsNumber: true })}
                                    type="number"
                                    placeholder="0 ~ 예산 이하"
                                    className="input"
                                />
                            </Field>

                            {/* 시작일 */}
                            <Field label="시작일" error={errors.startDate?.message}>
                                <input {...register("startDate")} type="date" className="input" />
                            </Field>

                            {/* 종료일 */}
                            <Field label="종료일" error={errors.endDate?.message}>
                                <input {...register("endDate")} type="date" className="input" />
                            </Field>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                                >
                                    {isSubmitting ? "등록 중..." : "등록"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// 필드 컴포넌트
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
