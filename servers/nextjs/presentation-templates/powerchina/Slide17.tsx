import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-17"
export const layoutName = "Template Slide Demo Flow"
export const layoutDescription =
  "示例页面：示例内容展示模板——左侧两块说明区域，右侧 4 个彩色编号流程条，底部示例条幅图片"

const LeftBlockSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(40)
    .default("示例模块一："),
  description: z
    .string()
    .min(10)
    .max(400)
    .default(
      "这是第一个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。"
    ),
})

const StepSchema = z.object({
  number: z
    .string()
    .min(1)
    .max(4)
    .default("01"),
  title: z
    .string()
    .min(2)
    .max(40)
    .default("示例步骤一："),
  description: z
    .string()
    .min(10)
    .max(300)
    .default(
      "这是第一个示例步骤的描述文字，用于展示示例流程，包含示例操作说明和示例执行步骤的详细描述。"
    ),
})

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(20)
      .default("示例页面标题")
      .meta({ description: "顶部标题栏中的页面标题示例" }),
    mainTitle: z
      .string()
      .min(2)
      .max(40)
      .default("示例主标题内容展示"),
    leftBlocks: z
      .array(LeftBlockSchema)
      .length(2)
      .default([
        {
          title: "示例模块一：",
          description:
            "这是第一个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
        },
        {
          title: "示例模块二：",
          description:
            "这是第二个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
        },
      ]),
    steps: z
      .array(StepSchema)
      .length(4)
      .default([
        {
          number: "01",
          title: "示例步骤一：",
          description:
            "这是第一个示例步骤的描述文字，用于展示示例流程，包含示例操作说明和示例执行步骤的详细描述。",
        },
        {
          number: "02",
          title: "示例步骤二：",
          description:
            "这是第二个示例步骤的描述文字，用于展示示例流程，包含示例操作说明和示例执行步骤的详细描述。",
        },
        {
          number: "03",
          title: "示例步骤三：",
          description:
            "这是第三个示例步骤的描述文字，用于展示示例流程，包含示例操作说明和示例执行步骤的详细描述。",
        },
        {
          number: "04",
          title: "示例步骤四：",
          description:
            "这是第四个示例步骤的描述文字，用于展示示例流程，包含示例操作说明和示例执行步骤的详细描述。",
        },
      ]),
  })
  .default({
    pageTitle: "示例页面标题",
    mainTitle: "示例主标题内容展示",
    leftBlocks: [
      {
        title: "示例模块一：",
        description:
          "这是第一个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
      },
      {
        title: "示例模块二：",
        description:
          "这是第二个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
      },
    ],
    steps: [
      {
        number: "01",
        title: "示例步骤一：",
        description:
          "这是第一个示例步骤的描述文字，用于展示示例流程，包含示例操作说明和示例执行步骤的详细描述。",
      },
      {
        number: "02",
        title: "示例步骤二：",
        description:
          "这是第二个示例步骤的描述文字，用于展示示例流程，包含示例操作说明和示例执行步骤的详细描述。",
      },
      {
        number: "03",
        title: "示例步骤三：",
        description:
          "这是第三个示例步骤的描述文字，用于展示示例流程，包含示例操作说明和示例执行步骤的详细描述。",
      },
      {
        number: "04",
        title: "示例步骤四：",
        description:
          "这是第四个示例步骤的描述文字，用于展示示例流程，包含示例操作说明和示例执行步骤的详细描述。",
      },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide17Props {
  data?: Partial<SlideData>
}

const Slide17: React.FC<Slide17Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    leftBlocks: data?.leftBlocks
      ? data.leftBlocks.map((b, i) => ({ ...base.leftBlocks[i], ...b }))
      : base.leftBlocks,
    steps: data?.steps
      ? data.steps.map((s, i) => ({ ...base.steps[i], ...s }))
      : base.steps,
  }

  const colors = [
    "from-[#3B82F6] to-[#2563EB]", // 01 蓝
    "from-[#F97316] to-[#EF4444]", // 02 橙红
    "from-[#10B981] to-[#059669]", // 03 绿
    "from-[#8B5CF6] to-[#6366F1]", // 04 紫
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
          <div className="text-[36px] font-semibold text-white">
            {slideData.pageTitle}
          </div>
        </div>

        {/* 主标题 */}
        <div className="px-12 pt-6 pb-4 text-[32px] font-semibold text-[#111827]">
          {slideData.mainTitle}
        </div>

        {/* 中部区域：左侧说明块 + 右侧 4 步流程 */}
        <div className="flex px-12 pb-6 gap-8 h-[520px]">
          {/* 左侧说明块 */}
          <div className="w-[45%] flex flex-col justify-between gap-6">
            {slideData.leftBlocks.map((block, idx) => (
              <div
                key={idx}
                className="flex-1 rounded-3xl bg-[#FDF5F5] px-10 py-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)] flex items-center"
              >
                <div className="space-y-3">
                  <div className="text-[24px] font-semibold text-[#D7443E]">
                    {block.title}
                  </div>
                  <div className="text-[18px] leading-[1.8] text-[#444444]">
                    {block.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 右侧 4 步箭头 */}
          <div className="w-[55%] flex flex-col justify-center gap-4">
            {slideData.steps.map((step, idx) => {
              const color = colors[idx] || colors[0]
              return (
                <div
                  key={idx}
                  className={`w-full h-[96px] rounded-full bg-gradient-to-r ${color} shadow-[0_10px_24px_rgba(0,0,0,0.18)] flex items-center px-8`}
                >
                  {/* 编号圆 */}
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center mr-6">
                    <span className="text-[24px] font-bold text-[#1F2937]">
                      {step.number}
                    </span>
                  </div>
                  {/* 文本 */}
                  <div className="flex-1 text-white">
                    <div className="text-[20px] font-semibold mb-1">
                      {step.title}
                    </div>
                    <div className="text-[16px] leading-[1.7]">
                      {step.description}
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

export default Slide17



