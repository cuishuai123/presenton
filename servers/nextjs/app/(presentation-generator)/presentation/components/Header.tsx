"use client";
import { Button } from "@/components/ui/button";
import {
  SquareArrowOutUpRight,
  Play,
  Loader2,
  Redo2 ,
  Undo2,
  RefreshCcw,
} from "lucide-react";
import React, { useState } from "react";
import Wrapper from "@/components/Wrapper";
import { useRouter, usePathname } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import { useDispatch, useSelector } from "react-redux";

import Link from "next/link";

import { RootState } from "@/store/store";
import { toast } from "sonner";


import Announcement from "@/components/Announcement";
import { PptxPresentationModel } from "@/types/pptx_models";
import HeaderNav from "../../components/HeaderNab";
import PDFIMAGE from "@/public/pdf.svg";
import PPTXIMAGE from "@/public/pptx.svg";
import Image from "next/image";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { usePresentationUndoRedo } from "../hooks/PresentationUndoRedo";
import ToolTip from "@/components/ToolTip";
import { clearPresentationData } from "@/store/slices/presentationGeneration";
import { clearHistory } from "@/store/slices/undoRedoSlice";
import { useTranslation } from "@/app/hooks/useTranslation";

const Header = ({
  presentation_id,
  currentSlide,
}: {
  presentation_id: string;
  currentSlide?: number;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();


  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  const { onUndo, onRedo, canUndo, canRedo } = usePresentationUndoRedo();

  /**
   * 获取 PPTX 模型，使用混合方案：
   * 1. 默认：先尝试直接转换（从 FastAPI 数据），失败则自动回退到 Puppeteer
   * 2. 如果默认方案失败，可以强制使用 Puppeteer 重试
   */
  const get_presentation_pptx_model = async (
    id: string, 
    forcePuppeteer: boolean = false
  ): Promise<PptxPresentationModel> => {
    // 构建 URL：默认方案会自动回退，forcePuppeteer 时强制使用 Puppeteer
    const url = forcePuppeteer
      ? `/api/presentation_to_pptx_model?id=${id}&method=puppeteer`
      : `/api/presentation_to_pptx_model?id=${id}`;
    
    console.log(`[PPTX Export] Fetching PPTX model: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      let errorMessage = `Failed to get PPTX model (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = response.status === 400 
          ? t('presentation.failedToGetPptxModel')
          : `${t('presentation.serverError')}: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    const pptx_model = await response.json();
    
    // 验证返回的是有效的 PPTX 模型（至少应该有 slides 字段）
    if (!pptx_model || !pptx_model.slides) {
      throw new Error("Invalid PPTX model received: missing slides field");
    }
    
    console.log(`[PPTX Export] Successfully got PPTX model with ${pptx_model.slides.length} slides`);
    
    return pptx_model;
  };

  const handleExportPptx = async () => {
    if (isStreaming) return;

    try {
      setOpen(false);
      setShowLoader(true);
      
      // Save the presentation data before exporting
      trackEvent(MixpanelEvent.Header_UpdatePresentationContent_API_Call);
      await PresentationGenerationApi.updatePresentationContent(presentationData);

      trackEvent(MixpanelEvent.Header_GetPptxModel_API_Call);
      
      let pptx_model: PptxPresentationModel | null = null;
      let lastError: Error | null = null;
      
      // 方案1：尝试默认方案（自动回退：直接转换 -> Puppeteer）
      try {
        console.log("[PPTX Export] Attempting default method (with auto-fallback)...");
        pptx_model = await get_presentation_pptx_model(presentation_id, false);
      } catch (error: any) {
        console.warn("[PPTX Export] Default method failed:", error.message);
        lastError = error;
        
        // 方案2：如果默认方案失败，强制使用 Puppeteer 重试
        try {
          console.log("[PPTX Export] Retrying with Puppeteer method...");
          pptx_model = await get_presentation_pptx_model(presentation_id, true);
        } catch (puppeteerError: any) {
          console.error("[PPTX Export] Puppeteer method also failed:", puppeteerError.message);
          lastError = puppeteerError;
          throw puppeteerError;
        }
      }
      
      if (!pptx_model) {
        throw new Error("Failed to get presentation PPTX model");
      }
      
      trackEvent(MixpanelEvent.Header_ExportAsPPTX_API_Call);
      const pptx_path = await PresentationGenerationApi.exportAsPPTX(pptx_model);
      
      if (pptx_path) {
        downloadLink(pptx_path);
      } else {
        throw new Error("No path returned from export");
      }
    } catch (error) {
      console.error("Export failed:", error);
      setShowLoader(false);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      
      toast.error(t('presentation.exportError') || "Having trouble exporting!", {
        description: errorMessage || 
          "We are having trouble exporting your presentation. Please try again.",
      });
    } finally {
      setShowLoader(false);
    }
  };

  const handleExportPdf = async () => {
    if (isStreaming) return;

    try {
      setOpen(false);
      setShowLoader(true);
      // Save the presentation data before exporting
      trackEvent(MixpanelEvent.Header_UpdatePresentationContent_API_Call);
      await PresentationGenerationApi.updatePresentationContent(presentationData);

      trackEvent(MixpanelEvent.Header_ExportAsPDF_API_Call);
      const response = await fetch('/api/export-as-pdf', {
        method: 'POST',
        body: JSON.stringify({
          id: presentation_id,
          title: presentationData?.title,
        })
      });

      if (response.ok) {
        const { path: pdfPath } = await response.json();
        // window.open(pdfPath, '_blank');
        downloadLink(pdfPath);
      } else {
        throw new Error("Failed to export PDF");
      }

    } catch (err) {
      console.error(err);
      toast.error("Having trouble exporting!", {
        description:
          "We are having trouble exporting your presentation. Please try again.",
      });
    } finally {
      setShowLoader(false);
    }
  };
  const handleReGenerate = () => {
    dispatch(clearPresentationData());
    dispatch(clearHistory())
    trackEvent(MixpanelEvent.Header_ReGenerate_Button_Clicked, { pathname });
    router.push(`/presentation?id=${presentation_id}&stream=true`);
  };
  const downloadLink = (path: string) => {
    // if we have popup access give direct download if not redirect to the path
    if (window.opener) {
      window.open(path, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = path;
      link.download = path.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
    }
  };

  const ExportOptions = ({ mobile }: { mobile: boolean }) => (
    <div className={`space-y-2 max-md:mt-4 ${mobile ? "" : "bg-white"} rounded-lg`}>
      <Button
        onClick={() => {
          trackEvent(MixpanelEvent.Header_Export_PDF_Button_Clicked, { pathname });
          handleExportPdf();
        }}
        variant="ghost"
        className={`pb-4 border-b rounded-none border-gray-300 w-full flex justify-start text-[#5146E5] ${mobile ? "bg-white py-6 border-none rounded-lg" : ""}`} >
        <Image src={PDFIMAGE} alt="pdf export" width={30} height={30} />
        {t('presentation.exportPDF')}
      </Button>
      <Button
        onClick={() => {
          trackEvent(MixpanelEvent.Header_Export_PPTX_Button_Clicked, { pathname });
          handleExportPptx();
        }}
        variant="ghost"
        className={`w-full flex justify-start text-[#5146E5] ${mobile ? "bg-white py-6" : ""}`}
      >
        <Image src={PPTXIMAGE} alt="pptx export" width={30} height={30} />
        {t('presentation.exportPPTX')}
      </Button>


    </div>
  );

  const MenuItems = ({ mobile }: { mobile: boolean }) => (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      {/* undo redo */}
      <button onClick={handleReGenerate} disabled={isStreaming || !presentationData} className="text-white  disabled:opacity-50" >
      
        {t('presentation.reGenerate')}
      </button>
      <div className="flex items-center gap-2 ">
        <ToolTip content={t('presentation.undo')}>
        <button disabled={!canUndo} className="text-white disabled:opacity-50" onClick={() => {
          onUndo();
        }}>

          <Undo2 className="w-6 h-6 " />
          
        </button>
          </ToolTip>
          <ToolTip content={t('presentation.redo')}>

        <button disabled={!canRedo} className="text-white disabled:opacity-50" onClick={() => {
          onRedo();
        }}>
          <Redo2 className="w-6 h-6 " />
         
        </button>
          </ToolTip>

      </div>

      {/* Present Button */}
      <Button
        onClick={() => {
          const to = `?id=${presentation_id}&mode=present&slide=${currentSlide || 0}`;
          trackEvent(MixpanelEvent.Navigation, { from: pathname, to });
          router.push(to);
        }}
        variant="ghost"
        className="border border-white font-bold text-white rounded-[32px] transition-all duration-300 group"
      >
        <Play className="w-4 h-4 mr-1 stroke-white group-hover:stroke-black" />
        {t('presentation.present')}
      </Button>

      {/* Desktop Export Button with Popover */}

      <div style={{
        zIndex: 100
      }} className="hidden lg:block relative ">
        <Popover open={open} onOpenChange={setOpen} >
          <PopoverTrigger asChild>
            <Button className={`border py-5 text-[#5146E5] font-bold rounded-[32px] transition-all duration-500 hover:border hover:bg-[#5146E5] hover:text-white w-full ${mobile ? "" : "bg-white"}`}>
              <SquareArrowOutUpRight className="w-4 h-4 mr-1" />
              {t('presentation.export')}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[250px] space-y-2 py-3 px-2 ">
            <ExportOptions mobile={false} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Export Section */}
      <div className="lg:hidden flex flex-col w-full">
        <ExportOptions mobile={true} />
      </div>
    </div>
  );

  return (
    <>
      <OverlayLoader
        show={showLoader}
        text={t('presentation.exporting')}
        showProgress={true}
        duration={40}
      />
      <div

        className="bg-[#5146E5] w-full shadow-lg sticky top-0 ">

        <Announcement />
        <Wrapper className="flex items-center justify-between py-1">
          <Link href="/dashboard" className="min-w-[162px]">
            <img
              className="h-16"
              src="/logo-white.png"
              alt="Presentation logo"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4 2xl:gap-6">
            {isStreaming && (
              <Loader2 className="animate-spin text-white font-bold w-6 h-6" />
            )}


            <MenuItems mobile={false} />
            <HeaderNav />
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-4">
            <HeaderNav />

          </div>
        </Wrapper>

      </div>
    </>
  );
};

export default Header;
