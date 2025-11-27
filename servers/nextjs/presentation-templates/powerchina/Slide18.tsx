import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-18"
export const layoutName = "Template Slide Demo Overview"
export const layoutDescription =
  "示例页面：左侧三层三角形图示，右侧定义/核心功能/核心价值说明区域，底部示例条幅图片"

const TextBlockSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(20)
    .default("标题"),
  body: z
    .string()
    .min(10)
    .max(800)
    .default(
      "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。"
    ),
})

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(40)
      .default("示例页面：什么是示例功能？")
      .meta({ description: "顶部标题栏中的页面标题示例" }),
    definition: TextBlockSchema.default({
      title: "定义：",
      body: "这是示例功能的定义说明，用于展示示例内容的基本概念和核心特征，帮助理解示例功能的作用和价值。",
    }),
    coreFunction: TextBlockSchema.default({
      title: "核心功能：",
      body:
        "这是示例功能的核心功能说明，用于展示示例内容的主要能力和关键特性，说明示例功能如何实现预期目标。",
    }),
    coreValue: TextBlockSchema.default({
      title: "核心价值：",
      body:
        "示例价值一：这是第一个示例价值的说明，用于展示示例内容带来的实际效益和重要意义。\n示例价值二：这是第二个示例价值的说明，用于展示示例内容带来的实际效益和重要意义。\n示例价值三：这是第三个示例价值的说明，用于展示示例内容带来的实际效益和重要意义。",
    }),
  })
  .default({
    pageTitle: "示例页面：什么是示例功能？",
    definition: {
      title: "定义：",
      body:
        "这是示例功能的定义说明，用于展示示例内容的基本概念和核心特征，帮助理解示例功能的作用和价值。",
    },
    coreFunction: {
      title: "核心功能：",
      body:
        "这是示例功能的核心功能说明，用于展示示例内容的主要能力和关键特性，说明示例功能如何实现预期目标。",
    },
    coreValue: {
      title: "核心价值：",
      body:
        "示例价值一：这是第一个示例价值的说明，用于展示示例内容带来的实际效益和重要意义。\n示例价值二：这是第二个示例价值的说明，用于展示示例内容带来的实际效益和重要意义。\n示例价值三：这是第三个示例价值的说明，用于展示示例内容带来的实际效益和重要意义。",
    },
  })

type SlideData = z.infer<typeof Schema>

interface Slide18Props {
  data?: Partial<SlideData>
}

const Slide18: React.FC<Slide18Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    definition: { ...base.definition, ...(data?.definition || {}) },
    coreFunction: { ...base.coreFunction, ...(data?.coreFunction || {}) },
    coreValue: { ...base.coreValue, ...(data?.coreValue || {}) },
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
        {/* 顶部标题栏 */}
        <div
          className="h-[72px] w-full flex items-center px-10"
          style={{ backgroundColor: "#0066B3" }}
        >
          <div className="text-[32px] font-semibold text-white">
            {slideData.pageTitle}
          </div>
        </div>

        {/* 主体区域：左侧三角图 + 右侧文字说明 */}
        <div className="flex px-12 pt-10 pb-6 gap-10 h-[520px]">
          {/* 左侧三角形区域 */}
          <div className="w-[40%] flex items-center justify-center">
            <div className="relative w-[360px] h-[360px]">
              {/* 大三角背景 */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  backgroundColor: "#3C7FD1",
                }}
              />
              {/* 中间浅色三角 */}
              <div
                className="absolute inset-[22%]"
                style={{
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  backgroundColor: "#7FA9E6",
                }}
              />
              {/* 底部左、右小三角 */}
              <div
                className="absolute inset-[22%]"
                style={{
                  clipPath: "polygon(0% 100%, 50% 0%, 0% 0%)",
                  backgroundColor: "#4E86D4",
                }}
              />
              <div
                className="absolute inset-[22%]"
                style={{
                  clipPath: "polygon(100% 100%, 50% 0%, 100% 0%)",
                  backgroundColor: "#C4D7F3",
                }}
              />
            </div>
          </div>

          {/* 右侧文字区域 */}
          <div className="w-[60%] flex flex-col justify-start space-y-6 text-[20px] leading-[1.9] text-[#111827]">
            {/* 定义 */}
            <div>
              <div className="text-[22px] font-semibold text-[#1D4ED8] mb-2">
                {slideData.definition.title}
              </div>
              <div className="text-[18px] text-[#111827]">
                {slideData.definition.body}
              </div>
            </div>
            {/* 核心功能 */}
            <div>
              <div className="text-[22px] font-semibold text-[#DC2626] mb-2">
                {slideData.coreFunction.title}
              </div>
              <div className="text-[18px] text-[#111827]">
                {slideData.coreFunction.body}
              </div>
            </div>
            {/* 核心价值 */}
            <div>
              <div className="text-[22px] font-semibold text-[#16A34A] mb-2">
                {slideData.coreValue.title}
              </div>
              <div className="text-[18px] text-[#111827] whitespace-pre-line">
                {slideData.coreValue.body}
              </div>
            </div>
          </div>
        </div>

        {/* 底部条幅图片 */}
        <div className="w-full h-[100px] flex items-center justify-center">
          <img
            src="/app_data/images/powerchina/slide_3.png"
            alt="示例底部条幅图片"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </>
  )
}

export default Slide18



