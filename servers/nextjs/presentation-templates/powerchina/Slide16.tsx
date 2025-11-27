import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-16"
export const layoutName = "Template Slide Demo Flow"
export const layoutDescription =
  "演示页面：示例内容展示模板——顶部标题栏和副标题，下方四个彩色编号模块依次展示不同类型示例说明，底部示例条幅图片"

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
    .default("示例标题内容："),
  description: z
    .string()
    .min(10)
    .max(200)
    .default(
      "这是示例描述文字，这是示例描述文字，这是示例描述文字，这是示例描述文字，这是示例描述文字。"
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
    steps: z
      .array(StepSchema)
      .length(4)
      .default([
        {
          number: "01",
          title: "示例模块一：",
          description:
            "这是第一个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
        },
        {
          number: "02",
          title: "示例模块二：",
          description:
            "这是第二个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
        },
        {
          number: "03",
          title: "示例模块三：",
          description:
            "这是第三个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
        },
        {
          number: "04",
          title: "示例模块四：",
          description:
            "这是第四个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
        },
      ]),
  })
  .default({
    pageTitle: "示例页面标题",
    mainTitle: "示例主标题内容展示",
    steps: [
      {
        number: "01",
        title: "示例模块一：",
        description:
          "这是第一个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
      },
      {
        number: "02",
        title: "示例模块二：",
        description:
          "这是第二个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
      },
      {
        number: "03",
        title: "示例模块三：",
        description:
          "这是第三个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
      },
      {
        number: "04",
        title: "示例模块四：",
        description:
          "这是第四个示例模块的描述文字，用于展示示例内容，包含示例功能说明和示例应用场景的详细描述。",
      },
    ],
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
        <div className="px-12 pt-4 pb-2 text-[32px] font-semibold text-[#111827]">
          {slideData.mainTitle}
        </div>

        {/* 四个示例模块块 */}
        <div className="px-12 pb-6 h-[500px] flex flex-col gap-4">
          {slideData.steps.map((step, idx) => {
            const color = colors[idx] || colors[0]
            return (
              <div
                key={idx}
                className={`w-full rounded-3xl px-8 py-5 bg-gradient-to-r ${color} shadow-[0_10px_24px_rgba(0,0,0,0.18)] flex items-center`}
              >
                {/* 编号区域 */}
                <div className="mr-6 flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <span className="text-[26px] font-bold text-[#1F2937]">
                      {step.number}
                    </span>
                  </div>
                </div>
                {/* 文本区域 */}
                <div className="flex-1 text-white">
                  <div className="text-[22px] font-semibold mb-2">
                    {step.title}
                  </div>
                  <div className="text-[16px] leading-[1.8]">
                    {step.description}
                  </div>
                </div>
              </div>
            )
          })}
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



