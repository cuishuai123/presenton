import React from "react"
import * as z from "zod"

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000"

export const layoutId = "powerchina-application-architecture-slide-9"
export const layoutName = "PowerChina Application Architecture"
export const layoutDescription =
  "应用架构图页：顶部蓝色标题栏，左侧整幅应用架构图片，右侧为模板说明文字，底部公司条幅图片"

const ArchitectureImageSchema = z
  .object({
    __image_url__: z
      .string()
      .url()
      .default(
        "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=1600&q=80&auto=format&fit=crop"
      )
      .describe("左侧应用架构示意图 URL，可替换为本地导出的截图"),
    __image_alt__: z
      .string()
      .min(0)
      .max(160)
      .default("应用架构示意图")
      .describe("左侧图片替代文本"),
  })
  .default({
    __image_url__:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=1600&q=80&auto=format&fit=crop",
    __image_alt__: "应用架构示意图",
  })

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(20)
      .default("应用架构图")
      .meta({ description: "顶部蓝色条中的页面标题" }),
    architectureImage: ArchitectureImageSchema,
    rightTitle: z
      .string()
      .min(2)
      .max(30)
      .default("满足多层次用户的多样化应用需求")
      .meta({ description: "右侧说明区域标题" }),
    rightDescription: z
      .string()
      .min(20)
      .max(800)
      .default(
        "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。"
      )
      .meta({ description: "右侧大段说明文字，可分多行展示" }),
  })
  .default({
    pageTitle: "应用架构图",
    architectureImage: ArchitectureImageSchema.parse({}),
    rightTitle: "满足多层次用户的多样化应用需求",
    rightDescription:
      "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
  })

type SlideData = z.infer<typeof Schema>

interface Slide9Props {
  data?: Partial<SlideData>
}

const Slide9: React.FC<Slide9Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    architectureImage: {
      ...base.architectureImage,
      ...(data?.architectureImage || {}),
    },
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

        {/* 主体区域：左侧整幅应用架构图片 + 右侧说明文字 */}
        <div className="flex px-10 pt-6 pb-4 gap-6 h-[520px]">
          {/* 左侧大图 */}
          <div className="w-[65%] h-full flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-md overflow-hidden flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
              <img
                src={slideData.architectureImage.__image_url__}
                alt={slideData.architectureImage.__image_alt__}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 右侧文字说明 */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-[28px] font-semibold mb-4 text-[#1F2933]">
              {slideData.rightTitle}
            </div>
            <div
              className="text-[18px] leading-[1.8]"
              style={{ color: "var(--text-body-color,#333333)" }}
            >
              {slideData.rightDescription}
            </div>
          </div>
        </div>

        {/* 底部条幅图片（与第七页一致，使用公司条幅图片） */}
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

export default Slide9


