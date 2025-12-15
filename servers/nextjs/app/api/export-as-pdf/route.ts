import path from "path";
import fs from "fs";
import puppeteer, { Browser, Page, ElementHandle } from "puppeteer";

import { sanitizeFilename } from "@/app/(presentation-generator)/utils/others";
import { NextResponse, NextRequest } from "next/server";
import { ApiError } from "@/models/errors";

const DEBUG_ENDPOINT =
  "http://127.0.0.1:7242/ingest/72ddb510-47f4-46a8-b1b0-944ee47a803c";
const DEBUG_SESSION_ID = "debug-session";
const DEBUG_FILE_TARGETS = [
  path.resolve(process.cwd(), "../../../.cursor/debug.log"),
  path.resolve(process.cwd(), ".cursor/debug.log"),
];

function agentLog(payload: {
  runId: string;
      hypothesisId: string;
      location: string;
      message: string;
  data: any;
}) {
  const body = {
    sessionId: DEBUG_SESSION_ID,
    timestamp: Date.now(),
    ...payload,
  };
  const json = JSON.stringify(body);

  // HTTP log (primary)
  fetch(DEBUG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
  }).catch(() => {});

  // File log (fallback)
  DEBUG_FILE_TARGETS.forEach((target) => {
    fs.promises
      .mkdir(path.dirname(target), { recursive: true })
      .then(() => fs.promises.appendFile(target, json + "\n"))
      .catch(() => {});
  });
}

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    const { id, title } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing Presentation ID" },
        { status: 400 }
      );
    }

    console.log(`[PDF Export] Starting PDF export for presentation: ${id}`);

    browser = await puppeteer.launch({
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
        // 确保字体正确渲染
        "--font-render-hinting=none",
      ],
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    page.setDefaultNavigationTimeout(300000);
    page.setDefaultTimeout(300000);
    
    // 设置额外的超时时间，避免字体加载超时
    // 注意：这不会影响 page.pdf() 的字体嵌入

    // 监听导航事件
    page.on("framenavigated", (frame) => {
      if (frame === page!.mainFrame()) {
        const url = frame.url();
        if (!url.includes("/pdf-maker") && url !== "about:blank") {
          console.warn(`[PDF Export] Frame navigated away from pdf-maker to: ${url}`);
        }
      }
    });

    // 拦截导航请求，防止被重定向
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();
      if (req.isNavigationRequest() && req.frame() === page!.mainFrame()) {
        if (url.includes("/pdf-maker") || url === "about:blank") {
          req.continue();
        } else {
          console.warn(`[PDF Export] Blocking navigation to: ${url}`);
          req.abort("aborted");
          return;
        }
      } else {
        req.continue();
      }
    });

    // 在 Docker 容器内，使用 localhost:3000 访问 Next.js 服务
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const pdfMakerUrl = `${baseUrl}/pdf-maker?id=${id}&stream=true&disableRedirect=1&userCode=export`;

    // #region agent log (hypothesis A: navigation/context)
    agentLog({
      runId: "run0",
      hypothesisId: "A",
      location: "route.ts:baseUrl",
      message: "Starting PDF export navigation context",
      data: { id, title, baseUrl, pdfMakerUrl },
    });
    // #endregion

    console.log(`[PDF Export] Navigating to: ${pdfMakerUrl}`);

    // 使用更宽松的等待策略
    try {
      await page.goto(pdfMakerUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
    } catch (gotoError: any) {
      const currentUrl = page.url();
      if (currentUrl.includes("/pdf-maker")) {
        console.warn(`[PDF Export] page.goto() timed out, but page is on pdf-maker. Continuing...`);
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
      console.warn(`[PDF Export] Detected redirect to ${currentUrl}, forcing back to pdf-maker (attempt ${redirectCount + 1})`);

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
        currentUrl = page.url();
        if (currentUrl.includes("/pdf-maker")) {
          break;
        }
        throw e;
      }
      currentUrl = page.url();
      redirectCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!currentUrl.includes("/pdf-maker")) {
      throw new ApiError(`Failed to stay on pdf-maker page after ${maxRedirects} attempts. Final URL: ${currentUrl}`);
    }

    console.log(`[PDF Export] Successfully on pdf-maker page: ${currentUrl}`);

    // 注入全局字体回退，确保中文可渲染（使用常见 CJK 字体或 Chrome 自带 Noto）
    try {
      await page.addStyleTag({
        content: `
          * {
            font-family: "Noto Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "Arial Unicode MS", "SimSun", "Heiti SC", sans-serif !important;
          }
        `,
      });
      console.log(`[PDF Export] Injected global font fallback`);
    } catch (e) {
      console.warn(`[PDF Export] Failed to inject font fallback: ${e}`);
    }

    // 等待页面 DOM 加载完成
    try {
      await page.waitForFunction('() => document.readyState === "complete" || document.readyState === "interactive"', {
        timeout: 30000,
      });
    } catch (e) {
      console.warn(`[PDF Export] Page readyState check timed out, but continuing...`);
    }

    // 提前注入中文字体（使用在线 Noto Sans SC）
    try {
      await page.addStyleTag({
        content: `
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');
          * { font-family: "Noto Sans SC", "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "Arial Unicode MS", sans-serif !important; }
        `,
      });
      console.log(`[PDF Export] Injected Noto Sans SC font (Google Fonts)`);
    } catch (e) {
      console.warn(`[PDF Export] Failed to inject Noto Sans SC font: ${e}`);
    }

    // 等待 #presentation-slides-wrapper 元素出现
    try {
      await page.waitForSelector("#presentation-slides-wrapper", {
        timeout: 30000,
      });
      console.log(`[PDF Export] Found #presentation-slides-wrapper element`);
    } catch (e) {
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

      console.warn(`[PDF Export] #presentation-slides-wrapper not found, but no error detected. Waiting a bit more...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      const wrapperExists = await page.evaluate(() => {
        return document.querySelector("#presentation-slides-wrapper") !== null;
      });

      if (!wrapperExists) {
        throw new ApiError(`#presentation-slides-wrapper element not found after extended wait`);
      }
    }

    // 等待内容加载（检查是否有实际的幻灯片内容）
    try {
      await page.waitForFunction(
        () => {
          const wrapper = document.querySelector("#presentation-slides-wrapper");
          if (!wrapper) return false;

          const slides = wrapper.querySelectorAll("[data-speaker-note]");
          if (slides.length > 0) {
            return true;
          }

          const loadingSkeletons = wrapper.querySelectorAll(".animate-pulse, .bg-gray-400, [class*='skeleton']");
          if (loadingSkeletons.length > 0) {
            return false;
          }

          return wrapper.children.length > 0;
        },
        { timeout: 60000, polling: 2000 }
      );
      console.log(`[PDF Export] Content loaded in #presentation-slides-wrapper`);
    } catch (waitError: any) {
      console.warn(`[PDF Export] Content loading timeout, but continuing with PDF generation...`);
    }

    // 额外等待一下，确保所有内容都已渲染
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 等待字体加载完成（特别是中文字体）
    try {
      await page.evaluate(async () => {
        await document.fonts.ready;
        // 确保所有字体都已加载
        const fontFaces = Array.from(document.fonts);
        await Promise.all(fontFaces.map(font => font.loaded));
      });
      console.log(`[PDF Export] Fonts loaded`);
    } catch (error) {
      console.warn(`[PDF Export] Font loading check failed, continuing...`);
    }

    // 额外等待字体加载
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 将背景图和 <img> 转为 dataURL，防止外链加载失败导致背景缺失
    try {
      const inlineResult = await page.evaluate(async () => {
        const toDataUrl = async (url: string) => {
          try {
            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) throw new Error(`status ${res.status}`);
            const ct = res.headers.get("content-type") || "image/png";
            const buf = await res.arrayBuffer();
            let binary = "";
            const bytes = new Uint8Array(buf);
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            return `data:${ct};base64,${btoa(binary)}`;
          } catch {
            return null;
          }
        };

        const bgUrls: string[] = [];
        const imgUrls: string[] = [];

        const extractUrls = (str: string | null) => {
          if (!str) return;
          const matches = str.match(/url\\((['"]?)(.*?)\\1\\)/g);
          if (matches) {
            matches.forEach((m) => {
              const inner = m.replace(/url\\((['"]?)(.*?)\\1\\)/, "$2");
              if (inner && !inner.startsWith("data:")) bgUrls.push(inner);
            });
          }
        };

        const elements = Array.from(document.querySelectorAll("*"));
        elements.forEach((el) => {
          const style = window.getComputedStyle(el);
          extractUrls(style.backgroundImage);
        });

        const imgs = Array.from(document.images);
        imgs.forEach((img) => {
          if (img.src && !img.src.startsWith("data:")) imgUrls.push(img.src);
        });

        const bgMap: Record<string, string | null> = {};
        const imgMap: Record<string, string | null> = {};

        await Promise.all(
          Array.from(new Set(bgUrls)).map(async (u) => {
            bgMap[u] = await toDataUrl(u);
          })
        );
        await Promise.all(
          Array.from(new Set(imgUrls)).map(async (u) => {
            imgMap[u] = await toDataUrl(u);
          })
        );

        // 替换背景
        elements.forEach((el) => {
          const style = window.getComputedStyle(el);
          const bg = style.backgroundImage;
          if (bg) {
            const matches = bg.match(/url\\((['"]?)(.*?)\\1\\)/g);
            if (matches) {
              let newBg = bg;
              matches.forEach((m) => {
                const inner = m.replace(/url\\((['"]?)(.*?)\\1\\)/, "$2");
                if (bgMap[inner]) newBg = newBg.replace(inner, bgMap[inner] as string);
              });
              (el as HTMLElement).style.backgroundImage = newBg;
            }
          }
        });

        // 替换 img
        imgs.forEach((img) => {
          const data = imgMap[img.src];
          if (data) img.src = data;
        });

        const missingBg = Object.entries(bgMap)
          .filter(([_, v]) => !v)
          .map(([k]) => k)
          .slice(0, 5);
        const missingImg = Object.entries(imgMap)
          .filter(([_, v]) => !v)
          .map(([k]) => k)
          .slice(0, 5);

        return {
          bgCount: bgUrls.length,
          imgCount: imgUrls.length,
          bgInlined: Object.values(bgMap).filter(Boolean).length,
          imgInlined: Object.values(imgMap).filter(Boolean).length,
          missingBg,
          missingImg,
        };
      });
      console.log(`[PDF Export] Inline resources result:`, inlineResult);
      // #region agent log
      agentLog({
        runId: "run1",
        hypothesisId: "H2",
        location: "route.ts:inlineResources",
        message: "Inline background/image summary",
        data: inlineResult,
      });
      // #endregion
    } catch (e) {
      console.warn(`[PDF Export] Inline resources failed: ${e}`);
    }

    // 使用与 PPTX 导出相同的方法获取幻灯片包装器
    const slidesWrapper = await page.$("#presentation-slides-wrapper");
    if (!slidesWrapper) {
      throw new ApiError("#presentation-slides-wrapper element not found");
    }

    // 直接查找有 data-speaker-note 属性的元素（这是实际的幻灯片容器）
    // 根据 PdfMakerPage.tsx，data-speaker-note 在 :scope > div 上
    let slideElements: ElementHandle<Element>[] = await slidesWrapper.$$(":scope > div[data-speaker-note]") as ElementHandle<Element>[];
    
    console.log(`[PDF Export] Found ${slideElements.length} elements using ':scope > div[data-speaker-note]' selector`);

    // 如果找不到，尝试其他选择器
    if (slideElements.length === 0) {
      console.log(`[PDF Export] Trying fallback selector 'div[data-speaker-note]'...`);
      slideElements = await slidesWrapper.$$("div[data-speaker-note]") as ElementHandle<Element>[];
      console.log(`[PDF Export] Found ${slideElements.length} elements using fallback selector`);
    }

    // 如果还是找不到，尝试使用更宽泛的选择器
    if (slideElements.length === 0) {
      console.log(`[PDF Export] Trying broader selector 'div[data-speaker-note]' within wrapper...`);
      const allSlides = await page.$$("#presentation-slides-wrapper div[data-speaker-note]");
      // 只保留直接子元素（:scope > div[data-speaker-note]）
      for (const slide of allSlides) {
        const isDirectChild = await slide.evaluate((el) => {
          return el.parentElement?.id === "presentation-slides-wrapper";
        });
        if (isDirectChild) {
          slideElements.push(slide);
        }
      }
      console.log(`[PDF Export] Found ${slideElements.length} direct child slides`);
    }

    // 验证这些元素是否有实际内容（排除模板描述文本等）
    const validSlideElements: ElementHandle<Element>[] = [];
    for (const element of slideElements) {
      const elementInfo = await element.evaluate((el) => {
        // 检查是否有 data-speaker-note 属性
        const hasDataSpeakerNote = el.hasAttribute("data-speaker-note");
        
        // 检查是否有实际内容（排除只有模板描述的情况）
        const textContent = el.textContent || "";
        const hasRealContent = el.children.length > 0 || 
                              (textContent.trim().length > 0 && 
                               !textContent.includes("Modern gradient gray background") &&
                               !textContent.includes("for professional presentation"));
        
        // 检查尺寸
        const rect = el.getBoundingClientRect();
        const hasSize = rect.width > 100 && rect.height > 100; // 至少要有一定尺寸
        
        return {
          hasDataSpeakerNote,
          hasRealContent,
          hasSize,
          width: rect.width,
          height: rect.height,
        };
      });
      
      if (elementInfo.hasDataSpeakerNote && elementInfo.hasRealContent && elementInfo.hasSize) {
        validSlideElements.push(element);
        console.log(`[PDF Export] Valid slide ${validSlideElements.length}: ${elementInfo.width}x${elementInfo.height}`);
      } else {
        console.log(`[PDF Export] Skipping invalid element: hasDataSpeakerNote=${elementInfo.hasDataSpeakerNote}, hasRealContent=${elementInfo.hasRealContent}, hasSize=${elementInfo.hasSize}`);
      }
    }

    const slideCount = validSlideElements.length;
    console.log(`[PDF Export] Found ${slideCount} valid slides (from ${slideElements.length} total elements)`);

    if (slideCount === 0) {
      throw new ApiError("No valid slides found in presentation");
    }

    if (slideCount > 0) {
      const firstSlideStyle = await validSlideElements[0].evaluate((el) => {
        const style = window.getComputedStyle(el as HTMLElement);
        const parent = el.parentElement;
        const parentStyle = parent ? window.getComputedStyle(parent) : null;
        return {
          hasBg: !!style.backgroundImage && style.backgroundImage !== "none",
          bg: style.backgroundImage,
          bgSize: style.backgroundSize,
          parentHasBg:
            !!parentStyle?.backgroundImage &&
            parentStyle.backgroundImage !== "none",
          parentBg: parentStyle?.backgroundImage || "",
        };
      });
      // #region agent log
      agentLog({
        runId: "run1",
        hypothesisId: "H3",
        location: "route.ts:firstSlideStyle",
        message: "First valid slide background info",
        data: firstSlideStyle,
      });
      // #endregion
    }

    // 使用标准幻灯片尺寸（1280x720）
    const slideWidth = 1280;
    const slideHeight = 720;

    // 设置视口为标准幻灯片尺寸
    await page.setViewport({
      width: slideWidth,
      height: slideHeight,
      deviceScaleFactor: 1,
    });

    // 等待视口调整
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 为所有幻灯片添加临时标识符，以便后续操作
    const slideIds: string[] = [];
    for (let j = 0; j < validSlideElements.length; j++) {
      const tempId = `__pdf_slide_${j}__`;
      slideIds.push(tempId);
      await validSlideElements[j].evaluate((el, id) => {
        (el as HTMLElement).setAttribute('data-pdf-slide-id', id);
      }, tempId);
    }

    // 为每个幻灯片生成单独的 PDF 页面，然后合并
    const pdfPages: Buffer[] = [];
    
    // 首先获取所有幻灯片的 bounds（在隐藏之前）
    const slideBoundsList: Array<{ bounds: any; element: ElementHandle<Element> }> = [];
    for (let i = 0; i < validSlideElements.length; i++) {
      const slideElement = validSlideElements[i];
      const slideBounds = await slideElement.boundingBox();
      if (slideBounds) {
        slideBoundsList.push({ bounds: slideBounds, element: slideElement });
        console.log(`[PDF Export] Slide ${i + 1} bounds:`, slideBounds);
      } else {
        console.warn(`[PDF Export] Could not get bounds for slide ${i + 1}, skipping...`);
      }
    }
    
    console.log(`[PDF Export] Successfully got bounds for ${slideBoundsList.length} slides`);
    
    for (let i = 0; i < slideBoundsList.length; i++) {
      console.log(`[PDF Export] Processing slide ${i + 1}/${slideBoundsList.length}...`);

      const { bounds: slideBounds, element: slideElement } = slideBoundsList[i];

      // 等待字体和图片加载（在隐藏其他幻灯片之前）
      try {
        await page.evaluate(async () => {
          await document.fonts.ready;
          // 等待所有图片加载
          const images = Array.from(document.images);
          await Promise.all(
            images.map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // 即使失败也继续
                setTimeout(resolve, 3000); // 超时后继续
              });
            })
          );
        });
      } catch (e) {
        console.warn(`[PDF Export] Font/image loading check failed: ${e}`);
      }

      // 隐藏其他幻灯片，但保持当前幻灯片可见
      await page.evaluate((currentSlideId, allSlideIds) => {
        // 隐藏所有幻灯片
        allSlideIds.forEach((id: string) => {
          const slide = document.querySelector(`[data-pdf-slide-id="${id}"]`) as HTMLElement;
          if (slide) {
            if (id === currentSlideId) {
              // 确保当前幻灯片完全可见
              slide.style.display = 'block';
              slide.style.visibility = 'visible';
              slide.style.opacity = '1';
              slide.style.position = 'relative';
              slide.style.top = '0';
              slide.style.left = '0';
            } else {
              // 完全隐藏其他幻灯片
              slide.style.display = 'none';
            }
          }
        });

        // 滚动到页面顶部
        window.scrollTo(0, 0);
        
        // 确保当前幻灯片在视口顶部
        const currentSlide = document.querySelector(`[data-pdf-slide-id="${currentSlideId}"]`) as HTMLElement;
        if (currentSlide) {
          currentSlide.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      }, slideIds[i], slideIds);

      // 等待 DOM 更新和渲染
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 滚动到当前幻灯片，确保它在视口内
      await slideElement.evaluate((el) => {
        (el as HTMLElement).scrollIntoView({ behavior: 'instant', block: 'start' });
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 再次等待内容完全加载，特别是字体（简化逻辑避免超时）
      try {
        // 使用更短的超时时间，避免 ProtocolError
        await Promise.race([
          page.evaluate(async () => {
            // 等待字体加载完成（使用更短的超时）
            await Promise.race([
              document.fonts.ready,
              new Promise(resolve => setTimeout(resolve, 2000)) // 最多等待2秒
            ]);
            
            // 额外等待，确保所有内容都已渲染
            await new Promise(resolve => setTimeout(resolve, 500));
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)) // 总超时5秒
        ]);
        console.log(`[PDF Export] Fonts and content ready for slide ${i + 1}`);
      } catch (e) {
        console.warn(`[PDF Export] Additional wait failed or timed out: ${e}`);
        // 即使超时也继续，因为字体可能已经加载
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 验证当前幻灯片是否可见且有内容
      const slideInfo = await slideElement.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          visible: style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   style.opacity !== '0',
          hasSize: rect.width > 0 && rect.height > 0,
          hasContent: el.children.length > 0 || (el.textContent && el.textContent.trim().length > 0),
          width: rect.width,
          height: rect.height,
        };
      });

      if (!slideInfo.visible || !slideInfo.hasSize) {
        console.warn(`[PDF Export] Slide ${i + 1} is not visible or has no size, skipping...`);
        continue;
      }

      if (!slideInfo.hasContent) {
        console.warn(`[PDF Export] Slide ${i + 1} has no content, skipping...`);
        continue;
      }

      console.log(`[PDF Export] Slide ${i + 1} info: ${slideInfo.width}x${slideInfo.height}, visible: ${slideInfo.visible}, hasContent: ${slideInfo.hasContent}`);

      // 确保视口设置为标准尺寸
      await page.setViewport({
        width: slideWidth,
        height: slideHeight,
        deviceScaleFactor: 1,
      });

      // 再次等待视口调整
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 再次验证幻灯片内容
      const finalCheck = await slideElement.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          inViewport: rect.top >= 0 && rect.left >= 0 && 
                      rect.bottom <= window.innerHeight && 
                      rect.right <= window.innerWidth,
          visible: style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   style.opacity !== '0',
          hasContent: el.children.length > 0 || (el.textContent && el.textContent.trim().length > 0),
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }
        };
      });

      console.log(`[PDF Export] Slide ${i + 1} final check:`, finalCheck);
      // #region agent log
      agentLog({
        runId: "run1",
        hypothesisId: "H1",
        location: `route.ts:slideFinalCheck:${i + 1}`,
        message: "Slide visibility/content check",
        data: finalCheck,
      });
      // #endregion

      if (!finalCheck.visible || !finalCheck.hasContent) {
        console.warn(`[PDF Export] Slide ${i + 1} failed final check, skipping...`);
        continue;
      }

      // Force page/body size to single-slide height to avoid multi-page PDFs
      await page.evaluate((w, h) => {
        const html = document.documentElement;
        const body = document.body;
        html.style.margin = "0";
        body.style.margin = "0";
        html.style.width = `${w}px`;
        html.style.height = `${h}px`;
        body.style.width = `${w}px`;
        body.style.height = `${h}px`;
        body.style.overflow = "hidden";
        window.scrollTo(0, 0);
      }, slideWidth, slideHeight);

      const layoutMetrics = await page.evaluate((currentSlideId) => {
        const body = document.body;
        const html = document.documentElement;
        const slide = document.querySelector(`[data-pdf-slide-id="${currentSlideId}"]`) as HTMLElement | null;
        const rect = slide?.getBoundingClientRect();
        return {
          bodyScrollHeight: body.scrollHeight,
          bodyOffsetHeight: body.offsetHeight,
          bodyClientHeight: body.clientHeight,
          htmlScrollHeight: html.scrollHeight,
          htmlClientHeight: html.clientHeight,
          innerHeight: window.innerHeight,
          scrollY: window.scrollY,
          slideRect: rect
            ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
            : null,
        };
      }, slideIds[i]);
      // #region agent log
      agentLog({
        runId: "run2",
        hypothesisId: "H4",
        location: `route.ts:layoutMetrics:${i + 1}`,
        message: "Page/slide sizing before pdf",
        data: layoutMetrics,
      });
      // #endregion

      // Capture slide content signature to detect duplication across slides
      const slideSignature = await slideElement.evaluate((el) => {
        const style = window.getComputedStyle(el as HTMLElement);
        const imgs = Array.from(el.querySelectorAll("img")).map((img) => (img as HTMLImageElement).src);
        const texts = (el.textContent || "").replace(/\s+/g, " ").trim();
        const bg = style.backgroundImage;
        const children = el.children.length;
        return {
          htmlLength: (el as HTMLElement).innerHTML.length,
          textSample: texts.slice(0, 120),
          imgCount: imgs.length,
          imgSample: imgs.slice(0, 5),
          bg,
          children,
        };
      });
      // #region agent log
      agentLog({
        runId: "run3",
        hypothesisId: "H5",
        location: `route.ts:slideSignature:${i + 1}`,
        message: "Slide content signature",
        data: slideSignature,
      });
      // #endregion

      // 为当前幻灯片生成 PDF 页面
      // 使用标准尺寸，确保一致性
      // 移除 pageRanges，因为每个 PDF 应该只有一页
      const slidePdf = await page.pdf({
        width: `${slideWidth}px`,
        height: `${slideHeight}px`,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        // 确保字体嵌入，避免乱码
        tagged: false,
        // 使用标准字体，确保中文字符正确显示
        format: undefined, // 使用自定义尺寸
        pageRanges: "1",
      });

      console.log(`[PDF Export] Generated PDF for slide ${i + 1}, size: ${slidePdf.length} bytes`);
      
      // 验证 PDF 是否有效
      if (slidePdf && slidePdf.length > 0) {
        pdfPages.push(Buffer.from(slidePdf));
        console.log(`[PDF Export] Successfully added slide ${i + 1} to PDF pages array (total: ${pdfPages.length})`);
      } else {
        console.warn(`[PDF Export] Slide ${i + 1} generated empty PDF, skipping...`);
      }
    }

    // 恢复所有幻灯片的显示，并清理临时标识符
    for (let j = 0; j < validSlideElements.length; j++) {
      await validSlideElements[j].evaluate((el) => {
        (el as HTMLElement).style.display = '';
        (el as HTMLElement).style.visibility = '';
        (el as HTMLElement).style.opacity = '';
        (el as HTMLElement).style.position = '';
        (el as HTMLElement).style.top = '';
        (el as HTMLElement).style.left = '';
        (el as HTMLElement).removeAttribute('data-pdf-slide-id');
      });
    }

    // 合并所有 PDF 页面
    let pdfBuffer: Buffer;

    console.log(`[PDF Export] Preparing to merge ${pdfPages.length} PDF pages...`);

    if (pdfPages.length === 0) {
      throw new ApiError("No PDF pages generated");
    }

    if (pdfPages.length === 1) {
      // 只有一个幻灯片，直接使用
      console.log(`[PDF Export] Only one slide, using it directly`);
      pdfBuffer = pdfPages[0];
    } else {
      // 多个幻灯片，尝试使用 pdf-lib 合并
      try {
        console.log(`[PDF Export] Attempting to merge ${pdfPages.length} PDF pages using pdf-lib...`);
        const pdfLibModule = await import("pdf-lib") as any;
        const PDFDocument = pdfLibModule.PDFDocument as any;
        
        if (!PDFDocument) {
          throw new Error("PDFDocument not found in pdf-lib module");
        }
        
        const mergedPdf = await PDFDocument.create();

        for (let idx = 0; idx < pdfPages.length; idx++) {
          const pdfPage = pdfPages[idx];
          console.log(`[PDF Export] Merging page ${idx + 1}/${pdfPages.length}, size: ${pdfPage.length} bytes`);
          const pdfDoc = await PDFDocument.load(pdfPage);
          const pageIndices = pdfDoc.getPageIndices();
          console.log(`[PDF Export] Page ${idx + 1} has ${pageIndices.length} page(s)`);
          const pages = await mergedPdf.copyPages(pdfDoc, pageIndices);
          pages.forEach((p: any) => mergedPdf.addPage(p));
        }

        const mergedPdfBytes = await mergedPdf.save();
        pdfBuffer = Buffer.from(mergedPdfBytes);
        console.log(`[PDF Export] Successfully merged ${pdfPages.length} PDF pages using pdf-lib, final size: ${pdfBuffer.length} bytes`);
      } catch (error: any) {
        // 如果 pdf-lib 不可用，只使用第一个幻灯片
        console.error(`[PDF Export] pdf-lib merge failed: ${error?.message || error}`);
        console.error(`[PDF Export] Stack: ${error?.stack || 'N/A'}`);
        console.warn(`[PDF Export] Falling back to first slide only. To merge all slides, ensure pdf-lib is installed: npm install pdf-lib`);
        pdfBuffer = pdfPages[0] || Buffer.alloc(0);
        
        if (pdfPages.length > 1) {
          console.warn(`[PDF Export] Note: Only the first slide will be included. Install pdf-lib package to merge all ${pdfPages.length} slides.`);
        }
      }
    }

    console.log(`[PDF Export] PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    const sanitizedTitle = sanitizeFilename(title ?? "presentation");
    const maxNameLength = 80;
    const truncatedTitle =
      sanitizedTitle.length > maxNameLength
        ? sanitizedTitle.slice(0, maxNameLength - 3) + "..."
        : sanitizedTitle;
    const destinationPath = path.join(
      process.env.APP_DATA_DIRECTORY!,
      "exports",
      `${truncatedTitle}.pdf`
    );
    await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.promises.writeFile(destinationPath, pdfBuffer);

    console.log(`[PDF Export] PDF saved to: ${destinationPath}`);

    return NextResponse.json({
      success: true,
      path: destinationPath,
    });
  } catch (error: any) {
    console.error(`[PDF Export] Error:`, error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.detail || String(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Internal server error: ${error?.message || String(error)}` },
      { status: 500 }
    );
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}
