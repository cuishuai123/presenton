"use client";
import React from "react";

import UploadPage from "./components/UploadPage";
import Header from "@/app/(presentation-generator)/dashboard/components/Header";
import { useTranslation } from "@/app/hooks/useTranslation";

const Page = () => {
  const { t } = useTranslation();
  
  return (
    <div className="relative">
      <Header />
      <div className="flex flex-col items-center justify-center  py-8">
        <h1 className="text-3xl font-semibold font-instrument_sans">
          {t('upload.createPresentation')}
        </h1>
      </div>

      <UploadPage />
    </div>
  );
};

export default Page;
