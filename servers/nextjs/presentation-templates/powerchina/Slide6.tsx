import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-goals-slide-6"
export const layoutName = "PowerChina Construction Goals"
export const layoutDescription =
  "标题二页：顶部蓝色标题栏 + 多个蓝色标题块 + 模板正文说明，底部公司条幅图片"

const GoalBlockSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(40)
    .default("标题二标题")
    .describe("目标小节标题，例如“简洁的大模型对话界面”"),
  paragraph: z
    .string()
    .min(10)
    .max(500)
    .default(
      "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。"
    )
    .describe("目标说明正文，全部为模板占位文字，可根据项目实际替换。"),
})

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(20)
      .default("标题二")
      .meta({ description: "顶部蓝色条中的页面标题" }),
    goals: z
      .array(GoalBlockSchema)
      .length(6)
      .default([
        {
          title: "简洁的大模型对话界面",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "流畅的工作流画布与节点管理",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "高效的知识库管理能力",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "易用的智能体应用中心",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "开放兼容的开发者与应用生态",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "安全可控的数据与权限管理",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
      ]),
  })
  .default({
    pageTitle: "标题二",
    goals: [
      {
        title: "简洁的大模型对话界面",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "流畅的工作流画布与节点管理",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "高效的知识库管理能力",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "易用的智能体应用中心",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "开放兼容的开发者与应用生态",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "安全可控的数据与权限管理",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide6Props {
  data?: Partial<SlideData>
}

const Slide6: React.FC<Slide6Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    goals: data?.goals
      ? data.goals.map((g, i) => ({ ...base.goals[i], ...g }))
      : base.goals,
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
          className="h-[72px] w-full flex items-center px-10"
          style={{ backgroundColor: "#0066B3" }}
        >
          <div className="text-[36px] font-semibold text-white">
            {slideData.pageTitle}
          </div>
        </div>

        {/* 中部目标说明区域：两列排布的蓝色标题块 + 正文 */}
        <div className="px-10 pt-8 pb-4 grid grid-cols-2 gap-x-10 gap-y-8">
          {slideData.goals.map((goal, idx) => (
            <div key={idx} className="flex flex-col">
              {/* 蓝色标题块 */}
              <div className="inline-flex mb-3">
                <div
                  className="px-8 py-3 text-white text-[24px] font-semibold rounded-full"
                  style={{ backgroundColor: "#0070C0" }}
                >
                  {goal.title}
                </div>
              </div>
              {/* 正文说明（模板文字） */}
              <div
                className="text-[18px] leading-[1.8]"
                style={{ color: "var(--text-body-color,#333333)" }}
              >
                {goal.paragraph}
              </div>
            </div>
          ))}
        </div>

        {/* 底部条幅图片（与第四、第五页一致，使用 slide_3.png） */}
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

export default Slide6


