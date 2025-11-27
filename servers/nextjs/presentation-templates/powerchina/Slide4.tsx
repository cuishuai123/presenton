import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-background-slide-4"
export const layoutName = "PowerChina Construction Background"
export const layoutDescription =
  "目录一页：顶部蓝色标题栏，左侧 3 个文字模块，右侧 3 张示意图，底部蓝条与公司条幅"

const TextBlockSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(20)
    .default("标题一")
    .describe("模块标题"),
  paragraph: z
    .string()
    .min(10)
    .max(400)
    .default(
      "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。"
    )
    .describe("模块正文，支持多行"),
})

const ImageSchema = z.object({
  __image_url__: z
    .string()
    .url()
    .default(
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop"
    )
    .describe("示意图 URL"),
  __image_alt__: z
    .string()
    .min(0)
    .max(120)
    .default("AI / 数据平台示意图")
    .describe("图片替代文本"),
})

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(20)
      .default("目录一")
      .meta({ description: "顶部蓝色条中的页面标题" }),
    textBlocks: z
      .array(TextBlockSchema)
      .length(3)
      .default([
        {
          title: "标题一",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "标题二",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "标题三",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
      ]),
    images: z
      .array(ImageSchema)
      .length(3)
      .default([
        {
          __image_url__:
            "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&q=80&auto=format&fit=crop",
          __image_alt__: "AI+行业立方体示意图",
        },
        {
          __image_url__:
            "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=900&q=80&auto=format&fit=crop",
          __image_alt__: "平台首页示意图",
        },
        {
          __image_url__:
            "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=900&q=80&auto=format&fit=crop",
          __image_alt__: "开源生态地图示意图",
        },
      ]),
    highlightText: z
      .string()
      .min(4)
      .max(200)
      .default(
        "模板模板模板模板模板模板模板模板模板模板模板模板"
      )
      .meta({
        description: "底部浅蓝色条中的红色强调文字",
      }),
    footerText: z
      .string()
      .min(4)
      .max(80)
      .default("中国电建集团西北勘测设计研究院有限公司")
      .meta({ description: "最底部深蓝条中的公司名称" }),
  })
  .default({
    pageTitle: "目录一",
    textBlocks: [
      {
        title: "标题一",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "标题二",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "标题三",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
    ],
    images: [
      {
        __image_url__:
          "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&q=80&auto=format&fit=crop",
        __image_alt__: "AI+行业立方体示意图",
      },
      {
        __image_url__:
          "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=900&q=80&auto=format&fit=crop",
        __image_alt__: "平台首页示意图",
      },
      {
        __image_url__:
          "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=900&q=80&auto=format&fit=crop",
        __image_alt__: "开源生态地图示意图",
      },
    ],
    highlightText:
      "模板模板模板模板模板模板模板模板模板模板模板模板",
    footerText: "中国电建集团西北勘测设计研究院有限公司",
  })

type SlideData = z.infer<typeof Schema>

interface Slide4Props {
  data?: Partial<SlideData>
}

const Slide4: React.FC<Slide4Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    textBlocks: data?.textBlocks
      ? data.textBlocks.map((b, i) => ({ ...base.textBlocks[i], ...b }))
      : base.textBlocks,
    images: data?.images
      ? data.images.map((img, i) => ({ ...base.images[i], ...img }))
      : base.images,
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full rounded-sm max-w-[1280px] shadow-lg max-h-[720px] aspect-video relative z-20 mx-auto overflow-hidden"
        style={{
          fontFamily: "var(--heading-font-family, Albert Sans)",
          backgroundColor: "var(--card-background-color,#FFFFFF)",
        }}
      >
        {/* 顶部整条深蓝标题栏 */}
        <div
          className="h-[72px] w-full flex items-center px-10"
          style={{ backgroundColor: "#0066B3" }}
        >
          <div className="text-[36px] font-semibold text-white">
            {slideData.pageTitle}
          </div>
        </div>

        {/* 主体区域：左 3 个文本模块 + 右 3 张图片 */}
        <div className="flex px-10 pt-6 pb-4 gap-4 h-[520px]">
          {/* 左侧文本模块 */}
          <div className="flex-1 flex flex-col gap-4">
            {slideData.textBlocks.map((block, idx) => (
              <div
                key={idx}
                className="border border-[#0070C0] rounded-sm px-6 py-4"
              >
                {/* 蓝色标签条 */}
                <div className="inline-flex mb-3">
                  <div
                    className="px-8 py-2 text-white text-[22px] font-semibold rounded-sm"
                    style={{ backgroundColor: "#0070C0" }}
                  >
                    {block.title}
                  </div>
                </div>
                {/* 正文 */}
                <div
                  className="text-[16px] leading-[1.7]"
                  style={{ color: "var(--text-body-color,#333333)" }}
                >
                  {block.paragraph}
                </div>
              </div>
            ))}
          </div>

          {/* 右侧图片列 */}
          <div className="w-[32%] flex flex-col gap-4">
            {slideData.images.map((img, idx) => (
              <div
                key={idx}
                className="bg-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] rounded-md overflow-hidden flex-1 flex items-center justify-center"
              >
                <img
                  src={img.__image_url__}
                  alt={img.__image_alt__}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 底部浅蓝带 + 红色模板文字 */}

        {/* 最底部深蓝条改为整幅图片条幅（使用本地 slide_3.png） */}
        <div className="w-full h-[100px] flex items-center justify-center">
          <img
            src="/app_data/images/powerchina/slide_3.png"
            alt="PowerChina footer banner"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </>
  )
}

export default Slide4


