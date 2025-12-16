import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-24"
export const layoutName = "Template Slide Demo Outcomes"
export const layoutDescription =
  "示例成果·预期效果页：顶部章节与小节标题，上方 2 条项目级预期效果，下方 4 个彩色成效卡片，底部示例条幅图片"

const BulletSchema = z.object({
  text: z
    .string()
    .min(4)
    .max(200)
    .default(
      "这是示例效果的描述文字，用于展示示例内容，包含示例效果说明和示例应用场景。"
    ),
})

const OutcomeCardSchema = z.object({
  index: z
    .string()
    .min(1)
    .max(4)
    .default("01"),
  title: z
    .string()
    .min(2)
    .max(40)
    .default("示例成效标题"),
  body: z
    .string()
    .min(10)
    .max(400)
    .default(
      "这是示例成效的描述文字，用于展示示例内容，包含示例成效说明和示例应用场景的详细描述。"
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
      .default("示例预期效果"),
    introBullets: z
      .array(BulletSchema)
      .length(2)
      .default([
        {
          text: "这是第一个示例效果的描述文字，用于展示示例内容，包含示例效果说明和示例应用场景。",
        },
        {
          text: "这是第二个示例效果的描述文字，用于展示示例内容，包含示例效果说明和示例应用场景。",
        },
      ]),
    outcomes: z
      .array(OutcomeCardSchema)
      .length(4)
      .default([
        {
          index: "01",
          title: "示例成效一",
          body:
            "这是第一个示例成效的描述文字，用于展示示例内容，包含示例成效说明和示例应用场景的详细描述。",
        },
        {
          index: "02",
          title: "示例成效二",
          body:
            "这是第二个示例成效的描述文字，用于展示示例内容，包含示例成效说明和示例应用场景的详细描述。",
        },
        {
          index: "03",
          title: "示例成效三",
          body:
            "这是第三个示例成效的描述文字，用于展示示例内容，包含示例成效说明和示例应用场景的详细描述。",
        },
        {
          index: "04",
          title: "示例成效四",
          body:
            "这是第四个示例成效的描述文字，用于展示示例内容，包含示例成效说明和示例应用场景的详细描述。",
        },
      ]),
  })
  .default({
    sectionTitle: "示例章节标题",
    subTitle: "示例预期效果",
    introBullets: [
      {
        text: "这是第一个示例效果的描述文字，用于展示示例内容，包含示例效果说明和示例应用场景。",
      },
      {
        text: "这是第二个示例效果的描述文字，用于展示示例内容，包含示例效果说明和示例应用场景。",
      },
    ],
    outcomes: [
      {
        index: "01",
        title: "示例成效一",
        body:
          "这是第一个示例成效的描述文字，用于展示示例内容，包含示例成效说明和示例应用场景的详细描述。",
      },
      {
        index: "02",
        title: "示例成效二",
        body:
          "这是第二个示例成效的描述文字，用于展示示例内容，包含示例成效说明和示例应用场景的详细描述。",
      },
      {
        index: "03",
        title: "示例成效三",
        body:
          "这是第三个示例成效的描述文字，用于展示示例内容，包含示例成效说明和示例应用场景的详细描述。",
      },
      {
        index: "04",
        title: "示例成效四",
        body:
          "这是第四个示例成效的描述文字，用于展示示例内容，包含示例成效说明和示例应用场景的详细描述。",
      },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide24Props {
  data?: Partial<SlideData>
}

const Slide24: React.FC<Slide24Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    introBullets: data?.introBullets
      ? data.introBullets.map((b, i) => ({ ...base.introBullets[i], ...b }))
      : base.introBullets,
    outcomes: data?.outcomes
      ? data.outcomes.map((o, i) => ({ ...base.outcomes[i], ...o }))
      : base.outcomes,
  }

  const cardColors = ["#E3F2FD", "#FFF3E0", "#E8F5E9", "#F3E5F5"]
  const indexColors = ["#0EA5E9", "#F97316", "#22C55E", "#8B5CF6"]

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

        {/* 小节标题 */}
        <div className="px-12 pt-6 pb-2 text-[30px] font-semibold text-[#1F2937]">
          {slideData.subTitle}
        </div>

        {/* 顶部两条示例效果描述 */}
        <div className="px-16 pb-4 text-[18px] leading-[1.9] text-[#111827] space-y-1">
          {slideData.introBullets.map((b, idx) => (
            <div key={idx} className="flex">
              <span className="mr-2">•</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        {/* 下方四个彩色成效卡片 */}
        <div className="px-12 pb-6 grid grid-cols-4 gap-6">
          {slideData.outcomes.map((card, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-3xl px-6 py-6 shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
              style={{ backgroundColor: cardColors[idx] || "#E5E7EB" }}
            >
              <div className="text-[20px] font-semibold text-[#1F2937] mb-3 leading-snug">
                {card.title}
              </div>
              <div className="flex-1 text-[16px] leading-[1.9] text-[#374151]">
                {card.body}
              </div>
              <div className="mt-4 flex justify-start">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[16px] font-semibold"
                  style={{ backgroundColor: indexColors[idx] || "#0EA5E9" }}
                >
                  {card.index}
                </div>
              </div>
            </div>
          ))}
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

export default Slide24



