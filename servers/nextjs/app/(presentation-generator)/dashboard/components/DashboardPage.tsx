"use client";

import React, { useState, useEffect } from "react";

import Wrapper from "@/components/Wrapper";
import { DashboardApi } from "@/app/(presentation-generator)/services/api/dashboard";
import { PresentationGrid } from "@/app/(presentation-generator)/dashboard/components/PresentationGrid";


import Header from "@/app/(presentation-generator)/dashboard/components/Header";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useUserCode } from "@/app/(presentation-generator)/hooks/useUserCode";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { userCode, isReady } = useUserCode();
  const [presentations, setPresentations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const loadData = async () => {
      await fetchPresentations(userCode);
    };
    loadData();
  }, [isReady, userCode]);

  const fetchPresentations = async (code?: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      if (!code) {
        setPresentations([]);
        setError("未获取到用户信息，请重新从问知打开 PPT 助手");
        return;
      }
      const data = await DashboardApi.getPresentations(code);
      data.sort(
        (a: any, b: any) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setPresentations(data);
    } catch (err) {
      setError("加载演示文稿失败，请重试");
      setPresentations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removePresentation = (presentationId: string) => {
    setPresentations((prev: any) =>
      prev ? prev.filter((p: any) => p.id !== presentationId) : []
    );
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <Wrapper>
        <main className="container mx-auto px-4 py-8">
          <section>
            <h2 className="text-2xl font-roboto font-medium mb-6">
              {t('dashboard.allPresentations')}
            </h2>
            <PresentationGrid
              presentations={presentations}
              type="slide"
              isLoading={isLoading}
              error={error}
              onPresentationDeleted={removePresentation}
            />
          </section>
        </main>
      </Wrapper>
    </div>
  );
};

export default DashboardPage;
