import { ApiError } from "@/models/errors";
import { NextRequest, NextResponse } from "next/server";
import { PptxPresentationModel } from "@/types/pptx_models";

/**
 * 替代方案：直接从 FastAPI 获取 presentation 数据并转换为 PPTX 模型
 * 这个方案不需要 Puppeteer，直接从数据库数据生成 PPTX 模型
 * 
 * 优点：
 * - 不需要浏览器渲染，更稳定
 * - 速度更快
 * - 不依赖页面加载状态
 * 
 * 缺点：
 * - 需要实现从 content dict + layout 到 PPTX 模型的完整转换逻辑
 * - 可能无法完全保留所有样式细节（因为样式在 Layout 组件中）
 */

interface FastAPIPresentation {
  id: string;
  title?: string;
  slides: FastAPISlide[];
}

interface FastAPISlide {
  id: string;
  index: number;
  layout: string;
  layout_group: string;
  content: Record<string, any>;
  speaker_note?: string;
  properties?: Record<string, any>;
}

export async function GET(request: NextRequest) {
  try {
    const id = await getPresentationId(request);
    
    // 从 FastAPI 获取 presentation 数据
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const presentationUrl = `${fastApiUrl}/api/v1/ppt/presentation/${id}`;
    
    console.log(`[Direct PPTX Export] Fetching presentation from: ${presentationUrl}`);
    
    const response = await fetch(presentationUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `Failed to fetch presentation from FastAPI (${response.status}): ${errorText}`
      );
    }

    const presentation: FastAPIPresentation = await response.json();
    
    if (!presentation.slides || presentation.slides.length === 0) {
      throw new ApiError("Presentation has no slides");
    }

    console.log(`[Direct PPTX Export] Found ${presentation.slides.length} slides`);

    // 转换为 PPTX 模型
    const pptx_model = await convertPresentationToPptxModel(presentation);
    
    return NextResponse.json(pptx_model);
  } catch (error: any) {
    console.error("[Direct PPTX Export] Error:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(error, { status: 400 });
    }
    return NextResponse.json(
      { detail: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

async function getPresentationId(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    throw new ApiError("Presentation ID not found");
  }
  return id;
}

/**
 * 将 FastAPI presentation 数据转换为 PPTX 模型
 * 
 * 注意：这是一个简化版本，只提取基本的文本内容
 * 完整的实现需要：
 * 1. 解析 layout 信息以获取样式
 * 2. 处理图片、图标等资源
 * 3. 应用正确的字体、颜色、位置等样式
 */
async function convertPresentationToPptxModel(
  presentation: FastAPIPresentation
): Promise<PptxPresentationModel> {
  const slides = presentation.slides
    .sort((a, b) => a.index - b.index)
    .map((slide) => convertSlideToPptxSlide(slide));

  return {
    slides,
    name: presentation.title || `Presentation ${presentation.id}`,
  };
}

/**
 * 将单个 slide 转换为 PPTX slide 模型
 * 
 * 这是一个基础实现，只提取文本内容
 * 完整的实现需要根据 layout 类型应用不同的样式
 */
function convertSlideToPptxSlide(slide: FastAPISlide) {
  // 提取文本内容
  const textBoxes = extractTextFromContent(slide.content);
  
  // 创建基础的文本框
  const shapes = textBoxes.map((text, index) => ({
    shape_type: "textbox" as const,
    position: {
      left: 50 + index * 10, // 简单的位置布局
      top: 100 + index * 80,
      width: 1180,
      height: 100,
    },
    text_wrap: true,
    paragraphs: [
      {
        text_runs: [
          {
            text: text,
            font: {
              name: "Arial",
              size: 24,
              font_weight: 400,
              italic: false,
              color: "000000",
            },
          },
        ],
      },
    ],
  }));

  return {
    shapes,
    speaker_note: slide.speaker_note || "",
  };
}

/**
 * 从 slide content dict 中提取文本内容
 * 这是一个递归函数，会遍历整个 content 对象
 */
function extractTextFromContent(content: Record<string, any>): string[] {
  const texts: string[] = [];

  function traverse(obj: any, path: string = ""): void {
    if (typeof obj === "string" && obj.trim().length > 0) {
      // 跳过特殊字段
      if (
        path.includes("__image_prompt__") ||
        path.includes("__icon_query__") ||
        path.includes("__icon_name__") ||
        path.includes("url") ||
        path.includes("src")
      ) {
        return;
      }
      texts.push(obj.trim());
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        traverse(item, `${path}[${index}]`);
      });
    } else if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        traverse(obj[key], path ? `${path}.${key}` : key);
      });
    }
  }

  traverse(content);
  
  // 去重并过滤太短的文本
  return Array.from(new Set(texts)).filter((text) => text.length > 3);
}

