import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-23"
export const layoutName = "Template Slide Demo Metrics"
export const layoutDescription =
  "示例成果·技术指标页：顶部章节标题 + 技术指标副标题，中部 5 个技术指标卡片，底部示例条幅图片"

const MetricSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(30)
    .default("示例指标标题"),
  description: z
    .string()
    .min(10)
    .max(400)
    .default(
      "这是示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。"
    ),
})

export const Schema = z
  .object({
    sectionTitle: z
      .string()
      .min(2)
      .max(20)
      .default("示例章节标题"),
    subTitle: z
      .string()
      .min(2)
      .max(40)
      .default("示例技术指标"),
    metrics: z
      .array(MetricSchema)
      .length(5)
      .default([
        {
          title: "示例指标一",
          description:
            "这是第一个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
        },
        {
          title: "示例指标二",
          description:
            "这是第二个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
        },
        {
          title: "示例指标三",
          description:
            "这是第三个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
        },
        {
          title: "示例指标四",
          description:
            "这是第四个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
        },
        {
          title: "示例指标五",
          description:
            "这是第五个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
        },
      ]),
  })
      .default({
        sectionTitle: "示例章节标题",
        subTitle: "示例技术指标",
        metrics: [
          {
            title: "示例指标一",
            description:
              "这是第一个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
          },
          {
            title: "示例指标二",
            description:
              "这是第二个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
          },
          {
            title: "示例指标三",
            description:
              "这是第三个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
          },
          {
            title: "示例指标四",
            description:
              "这是第四个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
          },
          {
            title: "示例指标五",
            description:
              "这是第五个示例指标的描述文字，用于展示示例内容，包含示例指标说明和示例应用场景的详细描述。",
          },
        ],
      })

type SlideData = z.infer<typeof Schema>

interface Slide23Props {
  data?: Partial<SlideData>
}

const Slide23: React.FC<Slide23Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    metrics: data?.metrics
      ? data.metrics.map((m, i) => ({ ...base.metrics[i], ...m }))
      : base.metrics,
  }

  const colors = [
    "from-[#3B82F6] to-[#2563EB]", // 蓝
    "from-[#0EA5E9] to-[#0284C7]", // 青
    "from-[#10B981] to-[#059669]", // 绿
    "from-[#F97316] to-[#EF4444]", // 橙红
    "from-[#6366F1] to-[#4F46E5]", // 紫
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
            {slideData.sectionTitle}
          </div>
        </div>

        {/* 副标题 */}
        <div className="px-12 pt-6 pb-2 text-[30px] font-semibold text-[#1F2937]">
          {slideData.subTitle}
        </div>

        {/* 指标卡片区域：2 行布局 */}
        <div className="px-12 pb-6 grid grid-cols-2 gap-x-12 gap-y-10">
          {slideData.metrics.map((metric, idx) => {
            const color = colors[idx] || colors[0]
            return (
              <div
                key={idx}
                className="flex items-start gap-4"
              >
                {/* 圆形图标占位 */}
                <div
                  className={`mt-1 w-16 h-16 rounded-full bg-gradient-to-br ${color} shadow-[0_8px_20px_rgba(0,0,0,0.25)]`}
                />
                {/* 文本说明 */}
                <div>
                  <div className="text-[22px] font-semibold mb-1 text-[#1F2937]">
                    {metric.title}
                  </div>
                  <div className="text-[16px] leading-[1.8] text-[#374151]">
                    {metric.description}
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

export default Slide23



