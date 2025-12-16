import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-architecture-slide-5"
export const layoutName = "PowerChina AI Architecture"
export const layoutDescription =
  "整体架构页：顶部标题 + 大幅架构示意图，文字为模板占位内容"

const ArchitectureImageSchema = z
  .object({
    __image_url__: z
      .string()
      .url()
      .default(
        "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=1600&q=80&auto=format&fit=crop"
      )
      .describe("整体架构示意图 URL，可替换为本地导出的架构图"),
    __image_alt__: z
      .string()
      .min(0)
      .max(160)
      .default("标题一示意图")
      .describe("图片替代文本"),
  })
  .default({
    __image_url__:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=1600&q=80&auto=format&fit=crop",
    __image_alt__: "标题一示意图",
  })

export const Schema = z
  .object({
    title: z
      .string()
      .min(2)
      .max(40)
      .default("标题一")
      .meta({ description: "页面主标题，位于上方蓝色条中" }),
    subtitle: z
      .string()
      .min(2)
      .max(60)
      .default("本页为整体架构示意图，具体内容请根据项目实际替换")
      .meta({ description: "可选副标题，位于主标题下方的小字说明" }),
    architectureImage: ArchitectureImageSchema,
  })
  .default({
    title: "标题一",
    subtitle: "本页为整体架构示意图，具体内容请根据项目实际替换",
    architectureImage: ArchitectureImageSchema.parse({}),
  })

type SlideData = z.infer<typeof Schema>

interface Slide5Props {
  data?: Partial<SlideData>
}

const Slide5: React.FC<Slide5Props> = ({ data }) => {
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
        className="w-full rounded-sm max-w-[1280px] shadow-lg relative z-20 mx-auto overflow-hidden"
        style={{
          fontFamily: "var(--heading-font-family, Albert Sans)",
          backgroundColor: "var(--card-background-color,#FFFFFF)",
        }}
      >
        {/* 顶部整条深蓝标题栏 */}
        <div
          className="h-[72px] w-full flex flex-col justify-center px-10"
          style={{ backgroundColor: "#0066B3" }}
        >
          <div className="text-[32px] font-semibold text-white">
            {slideData.title}
          </div>
          
        </div>

        {/* 中部大幅架构图区域 */}
        <div className="px-8 py-4 h-[580px] flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-md shadow-[0_8px_20px_rgba(0,0,0,0.15)] overflow-hidden flex items-center justify-center">
            <img
              src={slideData.architectureImage.__image_url__}
              alt={slideData.architectureImage.__image_alt__}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* 底部条幅图片（与第四页一致，使用 slide_3.png，提升高度以减少底部空白） */}
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

export default Slide5


