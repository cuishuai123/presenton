import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-19"
export const layoutName = "Template Slide Demo Scenarios"
export const layoutDescription =
  "示例场景页：顶部标题 + 副标题，中间 2×2 四个彩色模块介绍不同示例功能，底部示例条幅图片"

const AssistantSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(20)
    .default("示例功能一"),
  description: z
    .string()
    .min(10)
    .max(400)
    .default(
      "这是第一个示例功能的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景。"
    ),
})

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(40)
      .default("示例功能中心"),
    subTitle: z
      .string()
      .min(2)
      .max(60)
      .default("示例场景：通用日常效率提升示例"),
    assistants: z
      .array(AssistantSchema)
      .length(4)
      .default([
        {
          title: "示例功能一",
          description:
            "这是第一个示例功能的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景。",
        },
        {
          title: "示例功能二",
          description:
            "这是第二个示例功能的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景。",
        },
        {
          title: "示例功能三",
          description:
            "这是第三个示例功能的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景。",
        },
        {
          title: "示例功能四",
          description:
            "这是第四个示例功能的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景。",
        },
      ]),
  })
  .default({
    pageTitle: "示例功能中心",
    subTitle: "示例场景：通用日常效率提升示例",
    assistants: [
      {
        title: "示例功能一",
        description:
          "这是第一个示例功能的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景。",
      },
      {
        title: "示例功能二",
        description:
          "这是第二个示例功能的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景。",
      },
      {
        title: "示例功能三",
        description:
          "这是第三个示例功能的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景。",
      },
      {
        title: "示例功能四",
        description:
          "这是第四个示例功能的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景。",
      },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide19Props {
  data?: Partial<SlideData>
}

const Slide19: React.FC<Slide19Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    assistants: data?.assistants
      ? data.assistants.map((a, i) => ({ ...base.assistants[i], ...a }))
      : base.assistants,
  }

  const colors = [
    "from-[#3B82F6] to-[#2563EB]", // 蓝
    "from-[#F97316] to-[#EF4444]", // 橙红
    "from-[#8B5CF6] to-[#6366F1]", // 紫
    "from-[#10B981] to-[#059669]", // 绿
  ]

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

        {/* 副标题 */}
        <div className="px-12 pt-6 pb-4 text-[30px] font-semibold text-[#1F2937]">
          {slideData.subTitle}
        </div>

        {/* 中部四块示例功能区域：左上/右上/左下/右下 */}
        <div className="px-12 pb-6 flex flex-col gap-10">
          {/* 上排两个 */}
          <div className="flex justify-between">
            {[0, 1].map((idx) => {
              const block = slideData.assistants[idx]
              const color = colors[idx]
              return (
                <div key={idx} className="w-[45%] flex items-center gap-6">
                  {/* 左侧简化图形块：圆角色块模拟图标区域 */}
                  <div
                    className={`w-[160px] h-[160px] rounded-[50px] bg-gradient-to-br ${color} shadow-[0_12px_30px_rgba(0,0,0,0.2)]`}
                  />
                  {/* 右侧文字说明 */}
                  <div className="flex-1">
                    <div className="text-[22px] font-semibold text-[#1F2937] mb-2">
                      {block.title}
                    </div>
                    <div className="text-[18px] leading-[1.8] text-[#374151]">
                      {block.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 下排两个 */}
          <div className="flex justify-between">
            {[2, 3].map((idx) => {
              const block = slideData.assistants[idx]
              const color = colors[idx]
              return (
                <div key={idx} className="w-[45%] flex items-center gap-6">
                  <div
                    className={`w-[160px] h-[160px] rounded-[50px] bg-gradient-to-br ${color} shadow-[0_12px_30px_rgba(0,0,0,0.2)]`}
                  />
                  <div className="flex-1">
                    <div className="text-[22px] font-semibold text-[#1F2937] mb-2">
                      {block.title}
                    </div>
                    <div className="text-[18px] leading-[1.8] text-[#374151]">
                      {block.description}
                    </div>
                  </div>
                </div>
              )
            })}
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

export default Slide19



