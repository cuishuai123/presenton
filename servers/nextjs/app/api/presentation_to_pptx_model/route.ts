import { ApiError } from "@/models/errors";
import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import {
  ElementAttributes,
  SlideAttributesResult,
} from "@/types/element_attibutes";
import { convertElementAttributesToPptxSlides } from "@/utils/pptx_models_utils";
import { PptxPresentationModel } from "@/types/pptx_models";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

interface GetAllChildElementsAttributesArgs {
  element: ElementHandle<Element>;
  rootRect?: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
  depth?: number;
  inheritedFont?: ElementAttributes["font"];
  inheritedBackground?: ElementAttributes["background"];
  inheritedBorderRadius?: number[];
  inheritedZIndex?: number;
  inheritedOpacity?: number;
  screenshotsDir: string;
}

export async function GET(request: NextRequest) {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    const id = await getPresentationId(request);

    // 首先检查 presentation 是否存在（通过直接调用 FastAPI）
    // 这样可以提前发现问题，避免启动 Puppeteer
    try {
      const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
      const checkUrl = `${fastApiUrl}/api/v1/ppt/presentation/${id}`;
      console.log(`[PPTX Export] Pre-checking presentation existence: ${checkUrl}`);
      
      const checkResponse = await fetch(checkUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        throw new ApiError(
          `Presentation not found (${checkResponse.status}): ${errorText}. Please check the presentation ID.`
        );
      }
      
      const presentationData = await checkResponse.json();
      if (!presentationData.slides || presentationData.slides.length === 0) {
        throw new ApiError("Presentation has no slides");
      }
      
      console.log(`[PPTX Export] Presentation pre-check successful. Found ${presentationData.slides.length} slides.`);
    } catch (preCheckError: any) {
      if (preCheckError instanceof ApiError) {
        throw preCheckError;
      }
      console.warn(`[PPTX Export] Pre-check failed: ${preCheckError.message}, but continuing with Puppeteer...`);
      // 继续执行 Puppeteer，可能页面有缓存的数据
    }
    
    // 默认使用 Puppeteer 方法以确保完整样式和元素支持
    // 直接转换方法目前只提取文本，不包含样式、布局、图片等
    // 因此默认跳过直接转换，直接使用 Puppeteer
    const useDirectMethod = request.nextUrl.searchParams.get("method") === "direct";
    const usePuppeteer = request.nextUrl.searchParams.get("method") !== "direct";
    
    if (useDirectMethod) {
      // 仅当明确指定 method=direct 时才使用直接转换
      try {
        console.log(`[PPTX Export] Using direct conversion method (limited - text only)...`);
        const directModel = await tryDirectConversion(id);
        if (directModel && directModel.slides && directModel.slides.length > 0) {
          console.log(`[PPTX Export] Direct conversion successful (note: text only, no styles)`);
          return NextResponse.json(directModel);
        }
      } catch (directError: any) {
        console.warn(`[PPTX Export] Direct conversion failed: ${directError.message}`);
        throw new ApiError(`Direct conversion failed: ${directError.message}. Use method=puppeteer for full style support.`);
      }
    }
    
    // 默认方案：使用 Puppeteer 渲染页面并提取（完整样式、布局、图片支持）
    console.log(`[PPTX Export] Using Puppeteer method (full style, layout, and element support)...`);
    [browser, page] = await getBrowserAndPage(id);
    const screenshotsDir = getScreenshotsDir();

    const { slides, speakerNotes } = await getSlidesAndSpeakerNotes(page);
    const slides_attributes = await getSlidesAttributes(slides, screenshotsDir);
    await postProcessSlidesAttributes(
      slides_attributes,
      screenshotsDir,
      speakerNotes
    );
    const slides_pptx_models =
      convertElementAttributesToPptxSlides(slides_attributes);
    const presentation_pptx_model: PptxPresentationModel = {
      slides: slides_pptx_models,
    };

    await closeBrowserAndPage(browser, page);

    return NextResponse.json(presentation_pptx_model);
  } catch (error: any) {
    console.error(error);
    await closeBrowserAndPage(browser, page);
    if (error instanceof ApiError) {
      return NextResponse.json(error, { status: 400 });
    }
    return NextResponse.json(
      { detail: `Internal server error: ${error.message}` },
      { status: 500 } 
    );
  }
}

/**
 * 尝试直接从 FastAPI 数据转换为 PPTX 模型
 * 这是一个轻量级的转换方法，不需要浏览器渲染
 */
async function tryDirectConversion(id: string): Promise<PptxPresentationModel> {
  const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
  const presentationUrl = `${fastApiUrl}/api/v1/ppt/presentation/${id}`;
  
  const response = await fetch(presentationUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`FastAPI returned ${response.status}`);
  }

  const presentation = await response.json();
  
  if (!presentation.slides || presentation.slides.length === 0) {
    throw new Error("Presentation has no slides");
  }

  // 基础转换：提取文本内容
  // 注意：这是一个简化版本，完整的实现需要解析 layout 和样式信息
  const slides = presentation.slides
    .sort((a: any, b: any) => a.index - b.index)
    .map((slide: any) => {
      const textBoxes = extractTextFromSlideContent(slide.content);
      
      return {
        shapes: textBoxes.map((text: string, index: number) => ({
          shape_type: "textbox" as const,
          position: {
            left: 50,
            top: 100 + index * 100,
            width: 1180,
            height: 80,
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
        })),
        speaker_note: slide.speaker_note || "",
      };
    });

  return {
    slides,
    name: presentation.title || `Presentation ${id}`,
  };
}

/**
 * 从 slide content 中提取文本
 */
function extractTextFromSlideContent(content: Record<string, any>): string[] {
  const texts: string[] = [];

  function traverse(obj: any): void {
    if (typeof obj === "string" && obj.trim().length > 0) {
      // 跳过特殊字段和 URL
      if (
        obj.startsWith("http://") ||
        obj.startsWith("https://") ||
        obj.startsWith("data:") ||
        obj.includes("__image") ||
        obj.includes("__icon")
      ) {
        return;
      }
      texts.push(obj.trim());
    } else if (Array.isArray(obj)) {
      obj.forEach((item) => traverse(item));
    } else if (obj && typeof obj === "object") {
      Object.values(obj).forEach((value) => traverse(value));
    }
  }

  traverse(content);
  
  // 去重并过滤太短的文本
  return Array.from(new Set(texts))
    .filter((text) => text.length > 3)
    .slice(0, 10); // 限制最多 10 个文本框
}

async function getPresentationId(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    throw new ApiError("Presentation ID not found");
  }
  return id;
}

async function getBrowserAndPage(id: string): Promise<[Browser, Page]> {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=TranslateUI",
      "--disable-ipc-flooding-protection",
    ],
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  page.setDefaultNavigationTimeout(300000);
  page.setDefaultTimeout(300000);

  // 监听导航事件，防止重定向
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      const url = frame.url();
      if (!url.includes("/pdf-maker") && url !== "about:blank") {
        console.warn(`[PPTX Export] Frame navigated away from pdf-maker to: ${url}`);
      }
    }
  });
  
  // 拦截导航请求，防止被重定向
  await page.setRequestInterception(true);
  page.on("request", (req) => {
      const url = req.url();
    // 如果是主框架的导航请求，且不是 pdf-maker 页面，则阻止
    if (req.isNavigationRequest() && req.frame() === page.mainFrame()) {
      if (url.includes("/pdf-maker") || url === "about:blank") {
        req.continue();
      } else {
        console.warn(`[PPTX Export] Blocking navigation to: ${url}`);
        req.abort("aborted");
        return;
      }
    } else {
    req.continue();
    }
  });

  // 在 Docker 容器内，使用 localhost:3000 访问 Next.js 服务
  // 添加 disableRedirect=1 和 userCode=export 参数，防止 UserCodeGate 重定向
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const pdfMakerUrl = `${baseUrl}/pdf-maker?id=${id}&stream=true&disableRedirect=1&userCode=export`;
  
  console.log(`[PPTX Export] Navigating to: ${pdfMakerUrl}`);
  
  // 使用更宽松的等待策略：先等待 DOM 加载完成，然后手动等待关键元素
  // networkidle0 太严格，页面可能有持续的网络请求（如轮询、重试等）
  try {
  await page.goto(pdfMakerUrl, {
      waitUntil: "domcontentloaded", // 改为更宽松的策略
      timeout: 60000, // 减少到 60 秒
    });
  } catch (gotoError: any) {
    // 如果 goto 超时，检查页面是否至少加载了 DOM
    const currentUrl = page.url();
    if (currentUrl.includes("/pdf-maker")) {
      console.warn(`[PPTX Export] page.goto() timed out, but page is on pdf-maker. Continuing...`);
    } else {
      throw new ApiError(`Failed to navigate to pdf-maker page: ${gotoError.message}`);
    }
  }
  
  // 立即注入 localStorage，设置 userCode，防止 UserCodeGate 重定向
  await page.evaluate(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('userCode', 'export');
    }
  });
  
  // 检查是否被重定向
  let currentUrl = page.url();
  let redirectCount = 0;
  const maxRedirects = 3;
  
  while (!currentUrl.includes("/pdf-maker") && redirectCount < maxRedirects) {
    console.warn(`[PPTX Export] Detected redirect to ${currentUrl}, forcing back to pdf-maker (attempt ${redirectCount + 1})`);
    
    // 重新注入 localStorage
    await page.evaluate(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('userCode', 'export');
      }
    });
    
    try {
    await page.goto(pdfMakerUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
    } catch (e) {
      // 即使超时，也检查 URL
      currentUrl = page.url();
      if (currentUrl.includes("/pdf-maker")) {
        break; // 如果已经在 pdf-maker，继续
      }
      throw e;
    }
    currentUrl = page.url();
    redirectCount++;
    
    // 等待一下再检查
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (!currentUrl.includes("/pdf-maker")) {
    throw new ApiError(`Failed to stay on pdf-maker page after ${maxRedirects} attempts. Final URL: ${currentUrl}`);
  }
  
  console.log(`[PPTX Export] Successfully on pdf-maker page: ${currentUrl}`);
  
  // 等待页面 DOM 加载完成（不等待所有资源）
  try {
    await page.waitForFunction('() => document.readyState === "complete" || document.readyState === "interactive"', {
      timeout: 30000,
    });
  } catch (e) {
    console.warn(`[PPTX Export] Page readyState check timed out, but continuing...`);
  }
  
  // 等待 React 应用初始化完成（检查是否有 #presentation-slides-wrapper 元素）
  // 这个元素是 PdfMakerPage 渲染的，如果它存在说明页面已经加载
  try {
    await page.waitForSelector("#presentation-slides-wrapper", {
      timeout: 30000,
    });
    console.log(`[PPTX Export] Found #presentation-slides-wrapper element`);
  } catch (e) {
    // 如果找不到，检查是否有错误信息
    const hasError = await page.evaluate(() => {
      const errorElement = document.querySelector('.text-red-700, [role="alert"], .error-message');
      return errorElement !== null;
    });
    
    if (hasError) {
      const errorText = await page.evaluate(() => {
        const errorElement = document.querySelector('.text-red-700, [role="alert"], .error-message');
        return errorElement?.textContent?.trim() || "Unknown error";
      });
      throw new ApiError(`Page shows error: ${errorText}`);
    }
    
    // 如果既没有 wrapper 也没有错误，可能是还在加载
    console.warn(`[PPTX Export] #presentation-slides-wrapper not found, but no error detected. Waiting a bit more...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 再次检查
    const wrapperExists = await page.evaluate(() => {
      return document.querySelector("#presentation-slides-wrapper") !== null;
    });
    
    if (!wrapperExists) {
      throw new ApiError(`#presentation-slides-wrapper element not found after extended wait`);
    }
  }
  
  // 再次确认 URL 没有变化
  const finalUrl = page.url();
  if (!finalUrl.includes("/pdf-maker")) {
    throw new ApiError(`Page was redirected away from pdf-maker. Final URL: ${finalUrl}`);
  }
  
  console.log(`[PPTX Export] Page fully loaded, URL: ${page.url()}`);

  return [browser, page];
}

async function closeBrowserAndPage(browser: Browser | null, page: Page | null) {
  await page?.close();
  await browser?.close();
}

function getScreenshotsDir() {
  const tempDir = process.env.TEMP_DIRECTORY;
  if (!tempDir) {
    console.warn(
      "TEMP_DIRECTORY environment variable not set, skipping screenshot"
    );
    throw new ApiError("TEMP_DIRECTORY environment variable not set");
  }
  const screenshotsDir = path.join(tempDir, "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  return screenshotsDir;
}

async function postProcessSlidesAttributes(
  slidesAttributes: SlideAttributesResult[],
  screenshotsDir: string,
  speakerNotes: string[]
) {
  for (const [index, slideAttributes] of slidesAttributes.entries()) {
    for (const element of slideAttributes.elements) {
      if (element.should_screenshot) {
        const screenshotPath = await screenshotElement(element, screenshotsDir);
        element.imageSrc = screenshotPath;
        element.should_screenshot = false;
        element.objectFit = "cover";
        element.element = undefined;
      }
    }
    slideAttributes.speakerNote = speakerNotes[index];
  }
}

async function screenshotElement(
  element: ElementAttributes,
  screenshotsDir: string
) {
  const screenshotPath = path.join(
    screenshotsDir,
    `${uuidv4()}.png`
  ) as `${string}.png`;

  // For SVG elements, use convertSvgToPng
  if (element.tagName === "svg") {
    const pngBuffer = await convertSvgToPng(element);
    fs.writeFileSync(screenshotPath, pngBuffer);
    return screenshotPath;
  }

  // Hide all elements except the target element and its ancestors
  await element.element?.evaluate(
    (el) => {
      const originalOpacities = new Map();

      const hideAllExcept = (targetElement: Element) => {
        const allElements = document.querySelectorAll("*");

        allElements.forEach((elem) => {
          const computedStyle = window.getComputedStyle(elem);
          originalOpacities.set(elem, computedStyle.opacity);

          if (
            targetElement === elem ||
            targetElement.contains(elem) ||
            elem.contains(targetElement)
          ) {
            (elem as HTMLElement).style.opacity = computedStyle.opacity || "1";
            return;
          }

          (elem as HTMLElement).style.opacity = "0";
        });
      };

      hideAllExcept(el);

      (el as any).__restoreStyles = () => {
        originalOpacities.forEach((opacity, elem) => {
          (elem as HTMLElement).style.opacity = opacity;
        });
      };
    },
    element.opacity,
    element.font?.color
  );

  const screenshot = await element.element?.screenshot({
    path: screenshotPath,
  });
  if (!screenshot) {
    throw new ApiError("Failed to screenshot element");
  }

  await element.element?.evaluate((el) => {
    if ((el as any).__restoreStyles) {
      (el as any).__restoreStyles();
    }
  });

  return screenshotPath;
}

const convertSvgToPng = async (element_attibutes: ElementAttributes) => {
  const svgHtml =
    (await element_attibutes.element?.evaluate((el) => {
      // Apply font color
      const fontColor = window.getComputedStyle(el).color;
      (el as HTMLElement).style.color = fontColor;

      return el.outerHTML;
    })) || "";

  const svgBuffer = Buffer.from(svgHtml);
  const pngBuffer = await sharp(svgBuffer)
    .resize(
      Math.round(element_attibutes.position!.width!),
      Math.round(element_attibutes.position!.height!)
    )
    .toFormat("png")
    .toBuffer();
  return pngBuffer;
};

async function getSlidesAttributes(
  slides: ElementHandle<Element>[],
  screenshotsDir: string
): Promise<SlideAttributesResult[]> {
  const slideAttributes = await Promise.all(
    slides.map((slide) =>
      getAllChildElementsAttributes({ element: slide, screenshotsDir })
    )
  );
  return slideAttributes;
}

async function getSlidesAndSpeakerNotes(page: Page) {
  const slides_wrapper = await getSlidesWrapper(page);
  const speakerNotes = await getSpeakerNotes(slides_wrapper);
  const slides = await slides_wrapper.$$(":scope > div > div");
  return { slides, speakerNotes };
}

async function getSlidesWrapper(page: Page): Promise<ElementHandle<Element>> {
  console.log(`[PPTX Export] Waiting for #presentation-slides-wrapper...`);
  
  try {
    // 等待元素出现，最多等待 30 秒
    const slides_wrapper = await page.waitForSelector("#presentation-slides-wrapper", {
      timeout: 30000,
    });
    
    if (!slides_wrapper) {
      // 检查页面是否显示错误信息
      const hasError = await page.evaluate(() => {
        const errorElement = document.querySelector('.text-red-700, [role="alert"], .error-message');
        return errorElement !== null;
    });

      if (hasError) {
        const errorText = await page.evaluate(() => {
          const errorElement = document.querySelector('.text-red-700, [role="alert"], .error-message');
          return errorElement?.textContent?.trim() || "Unknown error";
        });
        throw new ApiError(`Failed to load presentation: ${errorText}`);
      }
      
      throw new ApiError("Presentation slides not found");
    }
    
    console.log(`[PPTX Export] Found #presentation-slides-wrapper element`);
    
    // 等待内容加载（检查是否有实际的幻灯片内容，而不是加载骨架）
    // 增加等待时间，因为 API 调用可能需要更长时间
    try {
      await page.waitForFunction(
        () => {
          const wrapper = document.querySelector("#presentation-slides-wrapper");
          if (!wrapper) return false;
          
          // 检查是否有实际的幻灯片（有 data-speaker-note 属性）
          const slides = wrapper.querySelectorAll("[data-speaker-note]");
          if (slides.length > 0) {
            console.log(`[PPTX Export] Found ${slides.length} slides with data-speaker-note`);
            return true;
    }

          // 检查是否还在加载（有加载骨架）
          const loadingSkeletons = wrapper.querySelectorAll(".animate-pulse, .bg-gray-400, [class*='skeleton']");
          if (loadingSkeletons.length > 0) {
            return false;
          }
          
          // 检查是否有错误信息
          const errorElement = document.querySelector('.text-red-700, [role="alert"], .error-message');
          if (errorElement) {
            // 如果有错误，但 wrapper 存在，说明页面已经渲染完成（只是显示错误）
            // 这种情况下，我们仍然可以尝试提取内容（如果有的话）
            return wrapper.children.length > 0;
          }
          
          // 检查是否有任何子元素
          return wrapper.children.length > 0;
        },
        { timeout: 60000, polling: 2000 } // 增加到 60 秒，每 2 秒检查一次
      );
      
      console.log(`[PPTX Export] Content loaded in #presentation-slides-wrapper`);
    } catch (waitError: any) {
      // 如果等待超时，检查是否有错误信息
      const hasError = await page.evaluate(() => {
        const errorElement = document.querySelector('.text-red-700, [role="alert"], .error-message');
        return errorElement !== null;
      });
      
      if (hasError) {
        const errorText = await page.evaluate(() => {
          const errorElement = document.querySelector('.text-red-700, [role="alert"], .error-message');
          return errorElement?.textContent?.trim() || "Unknown error";
        });
        
        // 检查是否至少有一些内容可以提取
        const hasAnyContent = await page.evaluate(() => {
          const wrapper = document.querySelector("#presentation-slides-wrapper");
          if (!wrapper) return false;
          return wrapper.children.length > 0;
        });
        
        if (!hasAnyContent) {
          throw new ApiError(`Failed to load presentation content: ${errorText}`);
        } else {
          console.warn(`[PPTX Export] Page shows error but has some content, continuing...`);
        }
      }
      
      // 即使超时，也检查是否有任何内容
      const hasContent = await page.evaluate(() => {
        const wrapper = document.querySelector("#presentation-slides-wrapper");
        if (!wrapper) return false;
        return wrapper.children.length > 0;
      });
      
      if (!hasContent) {
        const currentUrl = page.url();
        const pageTitle = await page.title();
        throw new ApiError(
          `Presentation slides not found. Page URL: ${currentUrl}, Title: ${pageTitle}. Content did not load within timeout.`
        );
      }
      
      console.warn(`[PPTX Export] Content loading timeout, but wrapper has children, continuing...`);
    }
    
    return slides_wrapper;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 如果是超时错误，提供更详细的错误信息
    const currentUrl = page.url();
    const pageTitle = await page.title();
    
    console.error(`[PPTX Export] Failed to find slides wrapper. URL: ${currentUrl}, Title: ${pageTitle}`);
    
    throw new ApiError(
      `Presentation slides not found. Page URL: ${currentUrl}, Title: ${pageTitle}. Waiting failed: ${error.message}`
    );
  }
}

async function getSpeakerNotes(slides_wrapper: ElementHandle<Element>) {
  return await slides_wrapper.evaluate((el) => {
    return Array.from(el.querySelectorAll("[data-speaker-note]")).map(
      (el) => el.getAttribute("data-speaker-note") || ""
    );
  });
}

async function getAllChildElementsAttributes({
  element,
  rootRect = null,
  depth = 0,
  inheritedFont,
  inheritedBackground,
  inheritedBorderRadius,
  inheritedZIndex,
  inheritedOpacity,
  screenshotsDir,
}: GetAllChildElementsAttributesArgs): Promise<SlideAttributesResult> {
  // 标准幻灯片尺寸
  const STANDARD_SLIDE_WIDTH = 1280;
  const STANDARD_SLIDE_HEIGHT = 720;
  
  if (!rootRect) {
    const rootAttributes = await getElementAttributes(element);
    inheritedFont = rootAttributes.font;
    inheritedBackground = rootAttributes.background;
    inheritedZIndex = rootAttributes.zIndex;
    inheritedOpacity = rootAttributes.opacity;
    
    // 获取根元素的实际尺寸
    const actualRootRect = await element.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    });
    
    // 保存原始位置，用于计算相对位置
    const originalLeft = actualRootRect.left;
    const originalTop = actualRootRect.top;
    const originalWidth = actualRootRect.width;
    const originalHeight = actualRootRect.height;
    
    // 计算缩放比例（如果实际尺寸与标准尺寸不一致）
    // 限制缩放比例在合理范围内（0.5 到 2.0），避免极端缩放
    let scaleX = originalWidth > 0 ? STANDARD_SLIDE_WIDTH / originalWidth : 1;
    let scaleY = originalHeight > 0 ? STANDARD_SLIDE_HEIGHT / originalHeight : 1;
    
    // 限制缩放比例
    scaleX = Math.max(0.5, Math.min(2.0, scaleX));
    scaleY = Math.max(0.5, Math.min(2.0, scaleY));
    
    // 将 rootRect 标准化为标准尺寸
    rootRect = {
      left: 0,
      top: 0,
      width: STANDARD_SLIDE_WIDTH,
      height: STANDARD_SLIDE_HEIGHT,
    };
    
    // 存储缩放比例和原始位置，用于后续元素转换
    (rootRect as any).scaleX = scaleX;
    (rootRect as any).scaleY = scaleY;
    (rootRect as any).originalLeft = originalLeft;
    (rootRect as any).originalTop = originalTop;
    
    console.log(`[PPTX Export] Root element: ${originalWidth}x${originalHeight}, scale: ${scaleX.toFixed(3)}x${scaleY.toFixed(3)}`);
    
    // 如果根元素没有背景，尝试从计算样式中获取
    if (!inheritedBackground || !inheritedBackground.color) {
      const computedBackground = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        
        // 转换颜色为 hex
        function colorToHex(color: string): { hex: string | undefined; opacity: number | undefined } {
          if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
            return { hex: undefined, opacity: undefined };
          }
          
          // 处理 rgb/rgba
          const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1], 10);
            const g = parseInt(rgbMatch[2], 10);
            const b = parseInt(rgbMatch[3], 10);
            const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
            const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
            return { hex, opacity: a < 1 ? a : undefined };
          }
          
          // 处理 hex
          if (color.startsWith("#")) {
            const hex = color.slice(1).toUpperCase();
            return { hex: hex.length === 3 ? hex.split("").map(c => c + c).join("") : hex, opacity: undefined };
          }
          
          return { hex: undefined, opacity: undefined };
        }
        
        const bgResult = colorToHex(bgColor);
        if (bgResult.hex) {
          return {
            color: bgResult.hex,
            opacity: bgResult.opacity,
          };
        }
        return null;
      });
      
      if (computedBackground) {
        inheritedBackground = computedBackground;
        console.log(`[PPTX Export] Extracted root background from computed styles: ${computedBackground.color}`);
      }
    }
  }

  const directChildElementHandles = await element.$$(":scope > *");

  const allResults: { attributes: ElementAttributes; depth: number }[] = [];

  for (const childElementHandle of directChildElementHandles) {
    const attributes = await getElementAttributes(childElementHandle);

    if (
      ["style", "script", "link", "meta", "path"].includes(attributes.tagName)
    ) {
      continue;
    }

    if (
      inheritedFont &&
      !attributes.font &&
      attributes.innerText &&
      attributes.innerText.trim().length > 0
    ) {
      attributes.font = inheritedFont;
    }
    if (inheritedBackground && !attributes.background && attributes.shadow) {
      attributes.background = inheritedBackground;
    }
    if (inheritedBorderRadius && !attributes.borderRadius) {
      attributes.borderRadius = inheritedBorderRadius;
    }
    if (inheritedZIndex !== undefined && attributes.zIndex === 0) {
      attributes.zIndex = inheritedZIndex;
    }
    if (
      inheritedOpacity !== undefined &&
      (attributes.opacity === undefined || attributes.opacity === 1)
    ) {
      attributes.opacity = inheritedOpacity;
    }

    if (
      attributes.position &&
      attributes.position.left !== undefined &&
      attributes.position.top !== undefined
    ) {
      // 计算相对于根元素的位置
      // 注意：getBoundingClientRect() 返回的是相对于视口的位置
      // 我们需要使用原始根元素位置来计算相对位置
      const originalLeft = (rootRect as any).originalLeft ?? 0;
      const originalTop = (rootRect as any).originalTop ?? 0;
      
      const relativeLeft = attributes.position.left - originalLeft;
      const relativeTop = attributes.position.top - originalTop;
      
      // 获取缩放比例（如果存在）
      const scaleX = (rootRect as any).scaleX ?? 1;
      const scaleY = (rootRect as any).scaleY ?? 1;
      
      // 应用缩放比例，将实际尺寸转换为标准尺寸
      const scaledLeft = Math.round(relativeLeft * scaleX);
      const scaledTop = Math.round(relativeTop * scaleY);
      const scaledWidth = Math.round((attributes.position.width || 0) * scaleX);
      const scaledHeight = Math.round((attributes.position.height || 0) * scaleY);
      
      // 确保位置和尺寸在合理范围内
      attributes.position = {
        left: Math.max(0, Math.min(STANDARD_SLIDE_WIDTH, scaledLeft)),
        top: Math.max(0, Math.min(STANDARD_SLIDE_HEIGHT, scaledTop)),
        width: Math.max(1, Math.min(STANDARD_SLIDE_WIDTH, scaledWidth)),
        height: Math.max(1, Math.min(STANDARD_SLIDE_HEIGHT, scaledHeight)),
      };
    }

    // Ignore elements with no size (width or height)
    if (
      attributes.position === undefined ||
      attributes.position.width === undefined ||
      attributes.position.height === undefined ||
      attributes.position.width === 0 ||
      attributes.position.height === 0
    ) {
      continue;
    }

    // If element is paragraph and contains only inline formatting tags, don't go deeper
    if (attributes.tagName === "p") {
      const innerElementTagNames = await childElementHandle.evaluate((el) => {
        return Array.from(el.querySelectorAll("*")).map((e) =>
          e.tagName.toLowerCase()
        );
      });

      const allowedInlineTags = new Set(["strong", "u", "em", "code", "s"]);
      const hasOnlyAllowedInlineTags = innerElementTagNames.every((tag) =>
        allowedInlineTags.has(tag)
      );

      if (innerElementTagNames.length > 0 && hasOnlyAllowedInlineTags) {
        attributes.innerText = await childElementHandle.evaluate((el) => {
          return el.innerHTML;
        });
        allResults.push({ attributes, depth });
        continue;
      }
    }

    if (
      attributes.tagName === "svg" ||
      attributes.tagName === "canvas" ||
      attributes.tagName === "table"
    ) {
      attributes.should_screenshot = true;
      attributes.element = childElementHandle;
    }

    allResults.push({ attributes, depth });

    // If the element is a canvas, or table, we don't need to go deeper
    if (attributes.should_screenshot && attributes.tagName !== "svg") {
      continue;
    }

    const childResults = await getAllChildElementsAttributes({
      element: childElementHandle,
      rootRect: rootRect,
      depth: depth + 1,
      inheritedFont: attributes.font || inheritedFont,
      inheritedBackground: attributes.background || inheritedBackground,
      inheritedBorderRadius: attributes.borderRadius || inheritedBorderRadius,
      inheritedZIndex: attributes.zIndex || inheritedZIndex,
      inheritedOpacity: attributes.opacity || inheritedOpacity,
      screenshotsDir,
    });
    allResults.push(
      ...childResults.elements.map((attr) => ({
        attributes: attr,
        depth: depth + 1,
      }))
    );
  }

  // 优先使用根元素的背景，如果没有则从覆盖整个幻灯片的子元素中查找
  let backgroundColor = inheritedBackground?.color;
  if (depth === 0) {
    // 如果根元素没有背景，尝试从覆盖整个幻灯片的子元素中查找
    if (!backgroundColor) {
    const elementsWithRootPosition = allResults.filter(({ attributes }) => {
      return (
        attributes.position &&
        attributes.position.left === 0 &&
        attributes.position.top === 0 &&
        attributes.position.width === rootRect!.width &&
        attributes.position.height === rootRect!.height
      );
    });

    for (const { attributes } of elementsWithRootPosition) {
      if (attributes.background && attributes.background.color) {
        backgroundColor = attributes.background.color;
          console.log(`[PPTX Export] Found slide background from child element: ${backgroundColor}`);
        break;
      }
      }
    } else {
      console.log(`[PPTX Export] Using root element background: ${backgroundColor}`);
    }
  }

  const filteredResults =
    depth === 0
      ? allResults.filter(({ attributes }) => {
          const hasBackground =
            attributes.background && attributes.background.color;
          const hasBorder = attributes.border && attributes.border.color;
          const hasShadow = attributes.shadow && attributes.shadow.color;
          const hasText =
            attributes.innerText && attributes.innerText.trim().length > 0;
          const hasImage = attributes.imageSrc;
          const isSvg = attributes.tagName === "svg";
          const isCanvas = attributes.tagName === "canvas";
          const isTable = attributes.tagName === "table";

          const occupiesRoot =
            attributes.position &&
            attributes.position.left === 0 &&
            attributes.position.top === 0 &&
            attributes.position.width === rootRect!.width &&
            attributes.position.height === rootRect!.height;

          const hasVisualProperties =
            hasBackground || hasBorder || hasShadow || hasText;
          const hasSpecialContent = hasImage || isSvg || isCanvas || isTable;

          return (hasVisualProperties && !occupiesRoot) || hasSpecialContent;
        })
      : allResults;

  if (depth === 0) {
    const sortedElements = filteredResults
      .sort((a, b) => {
        const zIndexA = a.attributes.zIndex || 0;
        const zIndexB = b.attributes.zIndex || 0;
        if (zIndexA === zIndexB) {
          return a.depth - b.depth;
        }
        return zIndexB - zIndexA;
      })
      .map(({ attributes }) => {
        if (
          attributes.shadow &&
          attributes.shadow.color &&
          (!attributes.background || !attributes.background.color) &&
          backgroundColor
        ) {
          attributes.background = {
            color: backgroundColor,
            opacity: undefined,
          };
        }
        return attributes;
      });

    return {
      elements: sortedElements,
      backgroundColor,
    };
  } else {
    return {
      elements: filteredResults.map(({ attributes }) => attributes),
      backgroundColor,
    };
  }
}

async function getElementAttributes(
  element: ElementHandle<Element>
): Promise<ElementAttributes> {
  const attributes = await element.evaluate((el: Element) => {
    function colorToHex(color: string): {
      hex: string | undefined;
      opacity: number | undefined;
    } {
      if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
        return { hex: undefined, opacity: undefined };
      }

      if (color.startsWith("rgba(") || color.startsWith("hsla(")) {
        const match = color.match(/rgba?\(([^)]+)\)|hsla?\(([^)]+)\)/);
        if (match) {
          const values = match[1] || match[2];
          const parts = values.split(",").map((part) => part.trim());

          if (parts.length >= 4) {
            const opacity = parseFloat(parts[3]);
            const rgbColor = color
              .replace(/rgba?\(|hsla?\(|\)/g, "")
              .split(",")
              .slice(0, 3)
              .join(",");
            const rgbString = color.startsWith("rgba")
              ? `rgb(${rgbColor})`
              : `hsl(${rgbColor})`;

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = rgbString;
              const hexColor = ctx.fillStyle;
              const hex = hexColor.startsWith("#")
                ? hexColor.substring(1)
                : hexColor;
              const result = {
                hex,
                opacity: isNaN(opacity) ? undefined : opacity,
              };

              return result;
            }
          }
        }
      }

      if (color.startsWith("rgb(") || color.startsWith("hsl(")) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = color;
          const hexColor = ctx.fillStyle;
          const hex = hexColor.startsWith("#")
            ? hexColor.substring(1)
            : hexColor;
          return { hex, opacity: undefined };
        }
      }

      if (color.startsWith("#")) {
        const hex = color.substring(1);
        return { hex, opacity: undefined };
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return { hex: color, opacity: undefined };

      ctx.fillStyle = color;
      const hexColor = ctx.fillStyle;
      const hex = hexColor.startsWith("#") ? hexColor.substring(1) : hexColor;
      const result = { hex, opacity: undefined };

      return result;
    }

    function hasOnlyTextNodes(el: Element): boolean {
      const children = el.childNodes;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          return false;
        }
      }
      return true;
    }

    function parsePosition(el: Element) {
      const rect = el.getBoundingClientRect();
      return {
        left: isFinite(rect.left) ? rect.left : 0,
        top: isFinite(rect.top) ? rect.top : 0,
        width: isFinite(rect.width) ? rect.width : 0,
        height: isFinite(rect.height) ? rect.height : 0,
      };
    }

    function parseBackground(computedStyles: CSSStyleDeclaration) {
      const backgroundColorResult = colorToHex(computedStyles.backgroundColor);

      const background = {
        color: backgroundColorResult.hex,
        opacity: backgroundColorResult.opacity,
      };

      // Return undefined if background has no meaningful values
      if (!background.color && background.opacity === undefined) {
        return undefined;
      }

      return background;
    }

    function parseBackgroundImage(computedStyles: CSSStyleDeclaration) {
      const backgroundImage = computedStyles.backgroundImage;

      if (!backgroundImage || backgroundImage === "none") {
        return undefined;
      }

      // Extract URL from background-image style
      const urlMatch = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
      }

      return undefined;
    }

    function parseBorder(computedStyles: CSSStyleDeclaration) {
      const borderColorResult = colorToHex(computedStyles.borderColor);
      const borderWidth = parseFloat(computedStyles.borderWidth);

      if (borderWidth === 0) {
        return undefined;
      }

      const border = {
        color: borderColorResult.hex,
        width: isNaN(borderWidth) ? undefined : borderWidth,
        opacity: borderColorResult.opacity,
      };

      // Return undefined if border has no meaningful values
      if (
        !border.color &&
        border.width === undefined &&
        border.opacity === undefined
      ) {
        return undefined;
      }

      return border;
    }

    function parseShadow(computedStyles: CSSStyleDeclaration) {
      const boxShadow = computedStyles.boxShadow;
      if (boxShadow !== "none") {
      }
      let shadow: {
        offset?: [number, number];
        color?: string;
        opacity?: number;
        radius?: number;
        angle?: number;
        spread?: number;
        inset?: boolean;
      } = {};

      if (boxShadow && boxShadow !== "none") {
        const shadows: string[] = [];
        let currentShadow = "";
        let parenCount = 0;

        for (let i = 0; i < boxShadow.length; i++) {
          const char = boxShadow[i];
          if (char === "(") {
            parenCount++;
          } else if (char === ")") {
            parenCount--;
          } else if (char === "," && parenCount === 0) {
            shadows.push(currentShadow.trim());
            currentShadow = "";
            continue;
          }
          currentShadow += char;
        }

        if (currentShadow.trim()) {
          shadows.push(currentShadow.trim());
        }

        let selectedShadow = "";
        let bestShadowScore = -1;

        for (let i = 0; i < shadows.length; i++) {
          const shadowStr = shadows[i];

          const shadowParts = shadowStr.split(" ");
          const numericParts: number[] = [];
          const colorParts: string[] = [];
          let isInset = false;
          let currentColor = "";
          let inColorFunction = false;

          for (let j = 0; j < shadowParts.length; j++) {
            const part = shadowParts[j];
            const trimmedPart = part.trim();
            if (trimmedPart === "") continue;

            if (trimmedPart.toLowerCase() === "inset") {
              isInset = true;
              continue;
            }

            if (trimmedPart.match(/^(rgba?|hsla?)\s*\(/i)) {
              inColorFunction = true;
              currentColor = trimmedPart;
              continue;
            }

            if (inColorFunction) {
              currentColor += " " + trimmedPart;

              const openParens = (currentColor.match(/\(/g) || []).length;
              const closeParens = (currentColor.match(/\)/g) || []).length;

              if (openParens <= closeParens) {
                colorParts.push(currentColor);
                currentColor = "";
                inColorFunction = false;
              }
              continue;
            }

            const numericValue = parseFloat(trimmedPart);
            if (!isNaN(numericValue)) {
              numericParts.push(numericValue);
            } else {
              colorParts.push(trimmedPart);
            }
          }

          let hasVisibleColor = false;
          if (colorParts.length > 0) {
            const shadowColor = colorParts.join(" ");
            const colorResult = colorToHex(shadowColor);
            hasVisibleColor = !!(
              colorResult.hex &&
              colorResult.hex !== "000000" &&
              colorResult.opacity !== 0
            );
          }

          const hasNonZeroValues = numericParts.some((value) => value !== 0);

          let shadowScore = 0;
          if (hasNonZeroValues) {
            shadowScore += numericParts.filter((value) => value !== 0).length;
          }
          if (hasVisibleColor) {
            shadowScore += 2;
          }

          if (
            (hasNonZeroValues || hasVisibleColor) &&
            shadowScore > bestShadowScore
          ) {
            selectedShadow = shadowStr;
            bestShadowScore = shadowScore;
          }
        }

        if (!selectedShadow && shadows.length > 0) {
          selectedShadow = shadows[0];
        }

        if (selectedShadow) {
          const shadowParts = selectedShadow.split(" ");
          const numericParts: number[] = [];
          const colorParts: string[] = [];
          let isInset = false;
          let currentColor = "";
          let inColorFunction = false;

          for (let i = 0; i < shadowParts.length; i++) {
            const part = shadowParts[i];
            const trimmedPart = part.trim();
            if (trimmedPart === "") continue;

            if (trimmedPart.toLowerCase() === "inset") {
              isInset = true;
              continue;
            }

            if (trimmedPart.match(/^(rgba?|hsla?)\s*\(/i)) {
              inColorFunction = true;
              currentColor = trimmedPart;
              continue;
            }

            if (inColorFunction) {
              currentColor += " " + trimmedPart;

              const openParens = (currentColor.match(/\(/g) || []).length;
              const closeParens = (currentColor.match(/\)/g) || []).length;

              if (openParens <= closeParens) {
                colorParts.push(currentColor);
                currentColor = "";
                inColorFunction = false;
              }
              continue;
            }

            const numericValue = parseFloat(trimmedPart);
            if (!isNaN(numericValue)) {
              numericParts.push(numericValue);
            } else {
              colorParts.push(trimmedPart);
            }
          }

          if (numericParts.length >= 2) {
            const offsetX = numericParts[0];
            const offsetY = numericParts[1];
            const blurRadius = numericParts.length >= 3 ? numericParts[2] : 0;
            const spreadRadius = numericParts.length >= 4 ? numericParts[3] : 0;

            // Only create shadow if color is present
            if (colorParts.length > 0) {
              const shadowColor = colorParts.join(" ");
              const shadowColorResult = colorToHex(shadowColor);

              if (shadowColorResult.hex) {
                shadow = {
                  offset: [offsetX, offsetY],
                  color: shadowColorResult.hex,
                  opacity: shadowColorResult.opacity,
                  radius: blurRadius,
                  spread: spreadRadius,
                  inset: isInset,
                  angle: Math.atan2(offsetY, offsetX) * (180 / Math.PI),
                };
              }
            }
          }
        }
      }

      // Return undefined if shadow is empty (no meaningful values)
      if (Object.keys(shadow).length === 0) {
        return undefined;
      }

      return shadow;
    }

    function parseFont(computedStyles: CSSStyleDeclaration) {
      const fontSize = parseFloat(computedStyles.fontSize);
      const fontWeight = parseInt(computedStyles.fontWeight);
      const fontColorResult = colorToHex(computedStyles.color);
      const fontFamily = computedStyles.fontFamily;
      const fontStyle = computedStyles.fontStyle;

      let fontName = undefined;
      if (fontFamily !== "initial") {
        const firstFont = fontFamily.split(",")[0].trim().replace(/['"]/g, "");
        fontName = firstFont;
      }

      const font = {
        name: fontName,
        size: isNaN(fontSize) ? undefined : fontSize,
        weight: isNaN(fontWeight) ? undefined : fontWeight,
        color: fontColorResult.hex,
        italic: fontStyle === "italic",
      };

      // Return undefined if font has no meaningful values
      if (
        !font.name &&
        font.size === undefined &&
        font.weight === undefined &&
        !font.color &&
        !font.italic
      ) {
        return undefined;
      }

      return font;
    }

    function parseLineHeight(computedStyles: CSSStyleDeclaration, el: Element) {
      const lineHeight = computedStyles.lineHeight;
      const innerText = el.textContent || "";

      const htmlEl = el as HTMLElement;

      const fontSize = parseFloat(computedStyles.fontSize);
      const computedLineHeight = parseFloat(computedStyles.lineHeight);

      const singleLineHeight = !isNaN(computedLineHeight)
        ? computedLineHeight
        : fontSize * 1.2;

      const hasExplicitLineBreaks =
        innerText.includes("\n") ||
        innerText.includes("\r") ||
        innerText.includes("\r\n");
      const hasTextWrapping = htmlEl.offsetHeight > singleLineHeight * 2;
      const hasOverflow = htmlEl.scrollHeight > htmlEl.clientHeight;

      const isMultiline =
        hasExplicitLineBreaks || hasTextWrapping || hasOverflow;

      if (isMultiline && lineHeight && lineHeight !== "normal") {
        const parsedLineHeight = parseFloat(lineHeight);
        if (!isNaN(parsedLineHeight)) {
          return parsedLineHeight;
        }
      }

      return undefined;
    }

    function parseMargin(computedStyles: CSSStyleDeclaration) {
      const marginTop = parseFloat(computedStyles.marginTop);
      const marginBottom = parseFloat(computedStyles.marginBottom);
      const marginLeft = parseFloat(computedStyles.marginLeft);
      const marginRight = parseFloat(computedStyles.marginRight);
      const marginObj = {
        top: isNaN(marginTop) ? undefined : marginTop,
        bottom: isNaN(marginBottom) ? undefined : marginBottom,
        left: isNaN(marginLeft) ? undefined : marginLeft,
        right: isNaN(marginRight) ? undefined : marginRight,
      };

      return marginObj.top === 0 &&
        marginObj.bottom === 0 &&
        marginObj.left === 0 &&
        marginObj.right === 0
        ? undefined
        : marginObj;
    }

    function parsePadding(computedStyles: CSSStyleDeclaration) {
      const paddingTop = parseFloat(computedStyles.paddingTop);
      const paddingBottom = parseFloat(computedStyles.paddingBottom);
      const paddingLeft = parseFloat(computedStyles.paddingLeft);
      const paddingRight = parseFloat(computedStyles.paddingRight);
      const paddingObj = {
        top: isNaN(paddingTop) ? undefined : paddingTop,
        bottom: isNaN(paddingBottom) ? undefined : paddingBottom,
        left: isNaN(paddingLeft) ? undefined : paddingLeft,
        right: isNaN(paddingRight) ? undefined : paddingRight,
      };

      return paddingObj.top === 0 &&
        paddingObj.bottom === 0 &&
        paddingObj.left === 0 &&
        paddingObj.right === 0
        ? undefined
        : paddingObj;
    }

    function parseBorderRadius(
      computedStyles: CSSStyleDeclaration,
      el: Element
    ) {
      const borderRadius = computedStyles.borderRadius;
      let borderRadiusValue;

      if (borderRadius && borderRadius !== "0px") {
        const radiusParts = borderRadius
          .split(" ")
          .map((part) => parseFloat(part));
        if (radiusParts.length === 1) {
          borderRadiusValue = [
            radiusParts[0],
            radiusParts[0],
            radiusParts[0],
            radiusParts[0],
          ];
        } else if (radiusParts.length === 2) {
          borderRadiusValue = [
            radiusParts[0],
            radiusParts[1],
            radiusParts[0],
            radiusParts[1],
          ];
        } else if (radiusParts.length === 3) {
          borderRadiusValue = [
            radiusParts[0],
            radiusParts[1],
            radiusParts[2],
            radiusParts[1],
          ];
        } else if (radiusParts.length === 4) {
          borderRadiusValue = radiusParts;
        }

        // Clamp border radius values to be between 0 and half the width/height
        if (borderRadiusValue) {
          const rect = el.getBoundingClientRect();
          const maxRadiusX = rect.width / 2;
          const maxRadiusY = rect.height / 2;

          borderRadiusValue = borderRadiusValue.map((radius, index) => {
            // For top-left and bottom-right corners, use maxRadiusX
            // For top-right and bottom-left corners, use maxRadiusY
            const maxRadius =
              index === 0 || index === 2 ? maxRadiusX : maxRadiusY;
            return Math.max(0, Math.min(radius, maxRadius));
          });
        }
      }

      return borderRadiusValue;
    }

    function parseShape(el: Element, borderRadiusValue: number[] | undefined) {
      if (el.tagName.toLowerCase() === "img") {
        return borderRadiusValue &&
          borderRadiusValue.length === 4 &&
          borderRadiusValue.every((radius: number) => radius === 50)
          ? "circle"
          : "rectangle";
      }
      return undefined;
    }

    function parseFilters(computedStyles: CSSStyleDeclaration) {
      const filter = computedStyles.filter;
      if (!filter || filter === "none") {
        return undefined;
      }

      const filters: {
        invert?: number;
        brightness?: number;
        contrast?: number;
        saturate?: number;
        hueRotate?: number;
        blur?: number;
        grayscale?: number;
        sepia?: number;
        opacity?: number;
      } = {};

      // Parse filter functions
      const filterFunctions = filter.match(/[a-zA-Z]+\([^)]*\)/g);
      if (filterFunctions) {
        filterFunctions.forEach((func) => {
          const match = func.match(/([a-zA-Z]+)\(([^)]*)\)/);
          if (match) {
            const filterType = match[1];
            const value = parseFloat(match[2]);

            if (!isNaN(value)) {
              switch (filterType) {
                case "invert":
                  filters.invert = value;
                  break;
                case "brightness":
                  filters.brightness = value;
                  break;
                case "contrast":
                  filters.contrast = value;
                  break;
                case "saturate":
                  filters.saturate = value;
                  break;
                case "hue-rotate":
                  filters.hueRotate = value;
                  break;
                case "blur":
                  filters.blur = value;
                  break;
                case "grayscale":
                  filters.grayscale = value;
                  break;
                case "sepia":
                  filters.sepia = value;
                  break;
                case "opacity":
                  filters.opacity = value;
                  break;
              }
            }
          }
        });
      }

      // Return undefined if no filters were parsed
      return Object.keys(filters).length > 0 ? filters : undefined;
    }

    function parseElementAttributes(el: Element) {
      let tagName = el.tagName.toLowerCase();

      const computedStyles = window.getComputedStyle(el);

      const position = parsePosition(el);

      const shadow = parseShadow(computedStyles);

      const background = parseBackground(computedStyles);

      const border = parseBorder(computedStyles);

      const font = parseFont(computedStyles);

      const lineHeight = parseLineHeight(computedStyles, el);

      const margin = parseMargin(computedStyles);

      const padding = parsePadding(computedStyles);

      const innerText = hasOnlyTextNodes(el)
        ? el.textContent || undefined
        : undefined;

      const zIndex = parseInt(computedStyles.zIndex);
      const zIndexValue = isNaN(zIndex) ? 0 : zIndex;

      const textAlign = computedStyles.textAlign as
        | "left"
        | "center"
        | "right"
        | "justify";
      const objectFit = computedStyles.objectFit as
        | "contain"
        | "cover"
        | "fill"
        | undefined;

      const parsedBackgroundImage = parseBackgroundImage(computedStyles);
      const imageSrc = (el as HTMLImageElement).src || parsedBackgroundImage;

      const borderRadiusValue = parseBorderRadius(computedStyles, el);

      const shape = parseShape(el, borderRadiusValue) as
        | "rectangle"
        | "circle"
        | undefined;

      // 判断文本是否应该换行
      // 默认允许换行，除非明确设置了 nowrap
      const whiteSpace = computedStyles.whiteSpace;
      const isNowrap = whiteSpace === "nowrap" || whiteSpace === "pre";
      
      // 检查元素的实际渲染情况
      const fontSize = parseFloat(computedStyles.fontSize) || 16;
      const computedLineHeight = parseFloat(computedStyles.lineHeight) || fontSize * 1.2;
      const elementHeight = (el as HTMLElement).offsetHeight;
      const elementWidth = (el as HTMLElement).offsetWidth;
      const scrollWidth = (el as HTMLElement).scrollWidth;
      const textContent = el.textContent || "";
      
      // 判断文本是否应该换行：
      // 1. 如果明确设置了 nowrap 或 pre，不换行
      // 2. 否则，默认允许换行（特别是对于长文本）
      // 3. 如果文本内容包含换行符（\n 或 \r），肯定需要换行
      // 4. 如果元素高度明显大于单行高度，说明已经换行了，需要换行
      // 5. 如果文本溢出（scrollWidth > offsetWidth），需要换行
      // 6. 如果文本很长（超过30个字符），即使当前没有换行，也应该允许换行
      const hasExplicitLineBreaks = textContent.includes("\n") || textContent.includes("\r");
      const hasTextWrapping = elementHeight > computedLineHeight * 1.5;
      const hasTextOverflow = scrollWidth > elementWidth;
      const isLongText = textContent.trim().length > 30; // 超过30个字符认为是长文本，应该允许换行
      
      // 如果明确设置了 nowrap，则不换行
      // 否则，默认允许换行（特别是对于长文本、已换行、溢出或包含换行符的情况）
      // 对于短文本且没有换行的情况，也允许换行（因为 PPTX 中可能需要根据容器宽度自动换行）
      const textWrap = !isNowrap;
      
      // 调试日志：记录长文本的换行判断
      if (isLongText || hasTextWrapping || hasTextOverflow) {
        console.log(`[PPTX Export] Text wrap decision for element with text length ${textContent.length}:`, {
          isNowrap,
          textWrap,
          hasExplicitLineBreaks,
          hasTextWrapping,
          hasTextOverflow,
          isLongText,
          elementWidth,
          scrollWidth,
          elementHeight,
          computedLineHeight,
        });
      }

      const filters = parseFilters(computedStyles);

      const opacity = parseFloat(computedStyles.opacity);
      const elementOpacity = isNaN(opacity) ? undefined : opacity;

      return {
        tagName: tagName,
        id: el.id,
        className:
          el.className && typeof el.className === "string"
            ? el.className
            : el.className
            ? el.className.toString()
            : undefined,
        innerText: innerText,
        opacity: elementOpacity,
        background: background,
        border: border,
        shadow: shadow,
        font: font,
        position: position,
        margin: margin,
        padding: padding,
        zIndex: zIndexValue,
        textAlign: textAlign !== "left" ? textAlign : undefined,
        lineHeight: lineHeight,
        borderRadius: borderRadiusValue,
        imageSrc: imageSrc,
        objectFit: objectFit,
        clip: false,
        overlay: undefined,
        shape: shape,
        connectorType: undefined,
        textWrap: textWrap,
        should_screenshot: false,
        element: undefined,
        filters: filters,
      };
    }

    return parseElementAttributes(el);
  });
  return attributes;
}
