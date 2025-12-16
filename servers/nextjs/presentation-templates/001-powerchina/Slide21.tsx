import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-21"
export const layoutName = "Template Slide Demo Plan"
export const layoutDescription =
  "示例计划页：顶部章节标题 + 示例计划表格（序号 / 交付内容 / 具体工作内容 / 时间安排），底部示例条幅图片"

const PlanRowSchema = z.object({
  index: z
    .string()
    .min(1)
    .max(3)
    .default("1"),
  deliveryItem: z
    .string()
    .min(2)
    .max(40)
    .default("示例交付内容一"),
  workContent: z
    .string()
    .min(10)
    .max(200)
    .default(
      "这是示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。"
    ),
  timeRange: z
    .string()
    .min(2)
    .max(40)
    .default("示例时间范围"),
})

export const Schema = z
  .object({
    sectionTitle: z
      .string()
      .min(2)
      .max(20)
      .default("示例章节标题")
      .meta({ description: "顶部标题栏中的章节标题示例" }),
    tableTitleRow: z
      .array(
        z
          .string()
          .min(1)
          .max(20)
      )
      .length(4)
      .default(["序号", "交付内容", "具体工作内容", "时间安排"]),
    rows: z
      .array(PlanRowSchema)
      .length(11)
      .default([
        {
          index: "1",
          deliveryItem: "示例交付内容一",
          workContent:
            "这是第一个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围一",
        },
        {
          index: "2",
          deliveryItem: "示例交付内容二",
          workContent:
            "这是第二个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围二",
        },
        {
          index: "3",
          deliveryItem: "示例交付内容三",
          workContent:
            "这是第三个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围三",
        },
        {
          index: "4",
          deliveryItem: "示例交付内容四",
          workContent:
            "这是第四个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围四",
        },
        {
          index: "5",
          deliveryItem: "示例交付内容五",
          workContent:
            "这是第五个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围五",
        },
        {
          index: "6",
          deliveryItem: "示例交付内容六",
          workContent:
            "这是第六个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围六",
        },
        {
          index: "7",
          deliveryItem: "示例交付内容七",
          workContent:
            "这是第七个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围七",
        },
        {
          index: "8",
          deliveryItem: "示例交付内容八",
          workContent:
            "这是第八个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围八",
        },
        {
          index: "9",
          deliveryItem: "示例交付内容九",
          workContent:
            "这是第九个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围九",
        },
        {
          index: "10",
          deliveryItem: "示例交付内容十",
          workContent:
            "这是第十个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围十",
        },
        {
          index: "11",
          deliveryItem: "示例交付内容十一",
          workContent:
            "这是第十一个示例工作内容的描述文字，用于展示示例内容，包含示例工作说明和示例执行步骤。",
          timeRange: "示例时间范围十一",
        },
      ]),
  })

type SlideData = z.infer<typeof Schema>

interface Slide21Props {
  data?: Partial<SlideData>
}

const Slide21: React.FC<Slide21Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    rows: data?.rows
      ? data.rows.map((r, i) => ({ ...base.rows[i], ...r }))
      : base.rows,
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
        {/* 顶部章节标题条 */}
        <div
          className="h-[72px] w-full flex items-center px-10"
          style={{ backgroundColor: "#0066B3" }}
        >
          <div className="text-[32px] font-semibold text-white">
            {slideData.sectionTitle}
          </div>
        </div>

        {/* 示例计划表格 */}
        <div className="px-10 pt-6 pb-6">
          <div className="border border-[#D1D5DB] rounded-md overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-[16px]">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  {slideData.tableTitleRow.map((title, idx) => (
                    <th
                      key={idx}
                      className={`border-b border-[#D1D5DB] px-4 py-3 text-left font-semibold text-[#111827] ${
                        idx === 0 ? "w-[6%]" : idx === 1 ? "w-[18%]" : idx === 3 ? "w-[16%]" : ""
                      }`}
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slideData.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}
                  >
                    <td className="border-t border-[#E5E7EB] px-4 py-3 text-center text-[#111827]">
                      {row.index}
                    </td>
                    <td className="border-t border-[#E5E7EB] px-4 py-3 text-[#111827] whitespace-pre-line align-top">
                      {row.deliveryItem}
                    </td>
                    <td className="border-t border-[#E5E7EB] px-4 py-3 text-[#4B5563] whitespace-pre-line align-top">
                      {row.workContent}
                    </td>
                    <td className="border-t border-[#E5E7EB] px-4 py-3 text-[#111827] text-center whitespace-pre-line align-top">
                      {row.timeRange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default Slide21



