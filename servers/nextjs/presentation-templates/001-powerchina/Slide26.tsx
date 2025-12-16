import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-26"
export const layoutName = "Template Slide Demo Budget"
export const layoutDescription =
  "示例预算页：顶部章节标题，示例费用统计，上方汇总信息，下方柱状图与右侧扇形图展示费用比例，底部示例条幅图片"

const SummarySchema = z.object({
  total: z.number().default(570),
  self: z.number().default(280),
  outsource: z.number().default(290),
  unit: z.string().default("万"),
})

const BarItemSchema = z.object({
  label: z
    .string()
    .min(1)
    .max(20)
    .default("示例模块"),
  value: z.number().default(50),
})

const PieSegmentSchema = z.object({
  label: z
    .string()
    .min(1)
    .max(20)
    .default("示例类别一"),
  value: z.number().default(50),
  color: z.string().default("#2563EB"),
})

export const Schema = z
  .object({
    sectionTitle: z
      .string()
      .min(2)
      .max(20)
      .default("示例章节标题"),
    summaryTitle: z
      .string()
      .min(2)
      .max(20)
      .default("示例费用统计"),
    summary: SummarySchema.default({
      total: 600,
      self: 320,
      outsource: 280,
      unit: "万",
    }),
    barTitle: z
      .string()
      .min(2)
      .max(30)
      .default("示例预算分布（单位：万元）"),
    bars: z
      .array(BarItemSchema)
      .default([
        { label: "示例模块一", value: 30 },
        { label: "示例模块二", value: 70 },
        { label: "示例模块三", value: 65 },
        { label: "示例模块四", value: 55 },
        { label: "示例模块五", value: 60 },
        { label: "示例模块六", value: 75 },
        { label: "示例模块七", value: 40 },
        { label: "示例模块八", value: 90 },
      ]),
    pieTitle: z
      .string()
      .min(2)
      .max(20)
      .default("费用比例"),
    pieSegments: z
      .array(PieSegmentSchema)
      .length(2)
      .default([
        { label: "示例类别一", value: 320, color: "#2563EB" },
        { label: "示例类别二", value: 280, color: "#F97316" },
      ]),
  })
  .default({
    sectionTitle: "示例章节标题",
    summaryTitle: "示例费用统计",
    summary: {
      total: 600,
      self: 320,
      outsource: 280,
      unit: "万",
    },
    barTitle: "示例预算分布（单位：万元）",
    bars: [
      { label: "示例模块一", value: 30 },
      { label: "示例模块二", value: 70 },
      { label: "示例模块三", value: 65 },
      { label: "示例模块四", value: 55 },
      { label: "示例模块五", value: 60 },
      { label: "示例模块六", value: 75 },
      { label: "示例模块七", value: 40 },
      { label: "示例模块八", value: 90 },
    ],
    pieTitle: "费用比例",
    pieSegments: [
      { label: "示例类别一", value: 320, color: "#2563EB" },
      { label: "示例类别二", value: 280, color: "#F97316" },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide26Props {
  data?: Partial<SlideData>
}

const Slide26: React.FC<Slide26Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    summary: { ...base.summary, ...(data?.summary || {}) },
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

  // Build conic-gradient string for simple扇形图
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

        {/* 中部主区域：左侧汇总与柱状图，右侧扇形图 */}
        <div className="flex px-8 pt-6 pb-6 gap-6 h-[520px]">
          {/* 左侧区域 */}
          <div className="flex-1 flex flex-col gap-4">
            {/* 汇总卡片 */}
            <div className="rounded-2xl bg-[#F3F4F6] px-10 py-8 shadow-sm flex items-center gap-10">
              <div>
                <div className="text-[22px] font-semibold text-[#111827] mb-4">
                  {slideData.summaryTitle}
                </div>
                <div className="flex gap-10 text-[20px] text-[#111827]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[18px]">总计：</span>
                    <span className="text-[26px] font-bold text-[#1F2937]">
                      {slideData.summary.total}
                      {slideData.summary.unit}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[18px]">类别一：</span>
                    <span className="text-[22px] font-semibold text-[#2563EB]">
                      {slideData.summary.self}
                      {slideData.summary.unit}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[18px]">类别二：</span>
                    <span className="text-[22px] font-semibold text-[#F97316]">
                      {slideData.summary.outsource}
                      {slideData.summary.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 柱状图卡片 */}
            <div className="flex-1 rounded-2xl bg-white border border-[#E5E7EB] px-8 py-6 shadow-sm">
              <div className="text-[20px] font-semibold mb-4 text-[#111827]">
                {slideData.barTitle}
              </div>
              <div className="flex items-end gap-4 h-[220px] pb-6 border-b border-[#E5E7EB]">
                {slideData.bars.map((bar, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                  >
                    <div
                      className="w-8 rounded-t-md bg-[#3B82F6]"
                      style={{
                        height: `${(bar.value / maxBar) * 100}%`,
                      }}
                    />
                    <div className="text-[14px] text-[#111827]">
                      {bar.value}
                    </div>
                  </div>
                ))}
              </div>
              {/* X 轴标签 */}
              <div className="mt-4 flex gap-4 text-[13px] text-[#4B5563]">
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

          {/* 右侧扇形图区域 */}
          <div className="w-[34%] rounded-2xl bg-white border border-[#E5E7EB] px-6 py-6 shadow-sm flex flex-col items-center">
            <div className="w-full text-[20px] font-semibold mb-4 text-[#111827]">
              {slideData.pieTitle}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              {/* 扇形图 */}
              <div className="relative w-52 h-52">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundImage: pieBackground }}
                />
                <div className="absolute inset-8 rounded-full bg-white flex flex-col items-center justify-center">
                  <div className="text-[18px] text-[#4B5563] mb-1">总计</div>
                  <div className="text-[28px] font-bold text-[#111827]">
                    {slideData.summary.total}
                    {slideData.summary.unit}
                  </div>
                </div>
              </div>

              {/* 图例 */}
              <div className="flex gap-6 text-[14px] text-[#4B5563]">
                {slideData.pieSegments.map((seg, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span>
                      {seg.label} {seg.value}
                      {slideData.summary.unit}
                    </span>
                  </div>
                ))}
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

export default Slide26



