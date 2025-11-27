import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-27"
export const layoutName = "Template Slide Demo Analysis"
export const layoutDescription =
  "示例数据分析页：顶部标题，下方柱状图 + 扇形图组合的分析报表，全部为模拟占位数据"

const SummaryCardSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(20)
    .default("示例指标名称"),
  value: z
    .string()
    .min(1)
    .max(20)
    .default("120"),
  unit: z.string().min(0).max(10).default("万"),
  note: z
    .string()
    .min(0)
    .max(80)
    .default("这是示例指标的说明文字，用于展示指标含义。"),
})

const BarItemSchema = z.object({
  label: z
    .string()
    .min(1)
    .max(20)
    .default("示例模块"),
  value: z.number().default(40),
})

const PieSegmentSchema = z.object({
  label: z
    .string()
    .min(1)
    .max(20)
    .default("示例类别"),
  value: z.number().default(25),
  color: z.string().default("#2563EB"),
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
      .default("示例数据分析（示意数据，仅供展示）"),
    summaryCards: z
      .array(SummaryCardSchema)
      .length(3)
      .default([
        {
          title: "示例总预算",
          value: "600",
          unit: "万",
          note: "当前示例整体预算规模的示意数据。",
        },
        {
          title: "示例占比",
          value: "55",
          unit: "%",
          note: "示例相关投入在整体预算中的占比（示意）。",
        },
        {
          title: "示例增幅",
          value: "18",
          unit: "%",
          note: "与上一年度相比的预算增长率（示意）。",
        },
      ]),
    barTitle: z
      .string()
      .min(2)
      .max(40)
      .default("示例维度预算分布（模拟数据）"),
    bars: z
      .array(BarItemSchema)
      .default([
        { label: "示例模块一", value: 25 },
        { label: "示例模块二", value: 48 },
        { label: "示例模块三", value: 42 },
        { label: "示例模块四", value: 36 },
        { label: "示例模块五", value: 50 },
        { label: "示例模块六", value: 30 },
        { label: "示例模块七", value: 55 },
      ]),
    pieTitle: z
      .string()
      .min(2)
      .max(40)
      .default("示例类型结构（模拟数据）"),
    pieSegments: z
      .array(PieSegmentSchema)
      .length(3)
      .default([
        { label: "示例类别一", value: 45, color: "#2563EB" },
        { label: "示例类别二", value: 30, color: "#F97316" },
        { label: "示例类别三", value: 25, color: "#10B981" },
      ]),
    comment: z
      .string()
      .min(0)
      .max(400)
      .default(
        "以上图表均为模板模拟数据，用于展示数据分析报表的结构示意，实际使用时可替换为真实统计结果。"
      ),
  })
  .default({
    sectionTitle: "示例章节标题",
    subTitle: "示例数据分析（示意数据，仅供展示）",
    summaryCards: [
      {
        title: "示例总预算",
        value: "600",
        unit: "万",
        note: "当前示例整体预算规模的示意数据。",
      },
      {
        title: "示例占比",
        value: "55",
        unit: "%",
        note: "示例相关投入在整体预算中的占比（示意）。",
      },
      {
        title: "示例增幅",
        value: "18",
        unit: "%",
        note: "与上一年度相比的预算增长率（示意）。",
      },
    ],
    barTitle: "示例维度预算分布（模拟数据）",
    bars: [
      { label: "示例模块一", value: 25 },
      { label: "示例模块二", value: 48 },
      { label: "示例模块三", value: 42 },
      { label: "示例模块四", value: 36 },
      { label: "示例模块五", value: 50 },
      { label: "示例模块六", value: 30 },
      { label: "示例模块七", value: 55 },
    ],
    pieTitle: "示例类型结构（模拟数据）",
    pieSegments: [
      { label: "示例类别一", value: 45, color: "#2563EB" },
      { label: "示例类别二", value: 30, color: "#F97316" },
      { label: "示例类别三", value: 25, color: "#10B981" },
    ],
    comment:
      "以上图表均为模板模拟数据，用于展示数据分析报表的结构示意，实际使用时可替换为真实统计结果。",
  })

type SlideData = z.infer<typeof Schema>

interface Slide27Props {
  data?: Partial<SlideData>
}

const Slide27: React.FC<Slide27Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    summaryCards: data?.summaryCards
      ? data.summaryCards.map((c, i) => ({ ...base.summaryCards[i], ...c }))
      : base.summaryCards,
    bars: data?.bars
      ? data.bars.map((b, i) => ({ ...base.bars[i], ...b }))
      : base.bars,
    pieSegments: data?.pieSegments
      ? data.pieSegments.map((p, i) => ({ ...base.pieSegments[i], ...p }))
      : base.pieSegments,
  }

  const maxBar = Math.max(...slideData.bars.map((b) => b.value || 0), 1)
  const totalPie = slideData.pieSegments.reduce(
    (sum, seg) => sum + (seg.value || 0),
    0
  )

  // 构造扇形图背景
  let currentPercent = 0
  const segments = slideData.pieSegments.map((seg) => {
    const pct = totalPie ? (seg.value / totalPie) * 100 : 0
    const start = currentPercent
    const end = currentPercent + pct
    currentPercent = end
    return `${seg.color} ${start}% ${end}%`
  })
  const pieBackground = `conic-gradient(${segments.join(", ")})`

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
        <div className="px-12 pt-4 pb-2 text-[24px] font-semibold text-[#1F2937]">
          {slideData.subTitle}
        </div>

        {/* 三个摘要卡片 */}
        <div className="px-12 pb-4 grid grid-cols-3 gap-6">
          {slideData.summaryCards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#F3F4F6] px-6 py-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="text-[18px] font-semibold text-[#111827] mb-2">
                  {card.title}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[30px] font-bold text-[#1F2937]">
                    {card.value}
                  </span>
                  <span className="text-[16px] text-[#4B5563]">
                    {card.unit}
                  </span>
                </div>
                <div className="text-[14px] text-[#4B5563] leading-relaxed">
                  {card.note}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 中部主体：左侧柱状图，右侧扇形图 */}
        <div className="px-12 pb-4 flex gap-6 h-[360px]">
          {/* 左侧图表区 */}
          <div className="flex-1">
            {/* 柱状图 */}
            <div className="h-full rounded-2xl bg-white border border-[#E5E7EB] px-6 py-4 shadow-sm flex flex-col">
              <div className="text-[18px] font-semibold mb-3 text-[#111827]">
                {slideData.barTitle}
              </div>
              <div className="flex-1 flex items-end gap-3 pb-4 border-b border-[#E5E7EB]">
                {slideData.bars.map((bar, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-1"
                  >
                    <div
                      className="w-6 rounded-t-md bg-[#3B82F6]"
                      style={{
                        height: `${(bar.value / maxBar) * 100}%`,
                      }}
                    />
                    <div className="text-[12px] text-[#111827]">
                      {bar.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-3 text-[12px] text-[#4B5563]">
                {slideData.bars.map((bar, idx) => (
                  <div
                    key={idx}
                    className="flex-1 text-center leading-snug break-words"
                  >
                    {bar.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧扇形图 */}
          <div className="w-[32%] rounded-2xl bg-white border border-[#E5E7EB] px-6 py-4 shadow-sm flex flex-col items-center">
            <div className="w-full text-[18px] font-semibold mb-3 text-[#111827]">
              {slideData.pieTitle}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="relative w-40 h-40">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundImage: pieBackground }}
                />
                <div className="absolute inset-8 rounded-full bg-white flex flex-col items-center justify-center">
                  <div className="text-[14px] text-[#4B5563] mb-1">总计</div>
                  <div className="text-[22px] font-bold text-[#111827]">
                    100%
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[13px] text-[#4B5563] w-full">
                {slideData.pieSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span>{seg.label}</span>
                    </div>
                    <span>{seg.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部文字说明 */}
        <div className="px-12 pb-4 text-[14px] text-[#4B5563] leading-relaxed">
          {slideData.comment}
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

export default Slide27



