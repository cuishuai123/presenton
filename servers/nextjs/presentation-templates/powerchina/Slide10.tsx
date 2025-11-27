import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-agent-architecture-slide-10"
export const layoutName = "PowerChina Agent Platform Architecture"
export const layoutDescription =
  "Agent 平台架构图页：顶部蓝色标题栏，左侧整幅 Agent 平台架构图，右侧为“价值亮点”说明卡片，底部公司条幅图片"

const AgentImageSchema = z
  .object({
    __image_url__: z
      .string()
      .url()
      .default(
        "/app_data/images/powerchina/agent_architecture.png"
      )
      .describe("左侧 Agent 平台架构示意图 URL，可替换为本地导出的截图"),
    __image_alt__: z
      .string()
      .min(0)
      .max(160)
      .default("Agent 平台架构图")
      .describe("左侧图片替代文本"),
  })
  .default({
    __image_url__: "/app_data/images/powerchina/agent_architecture.png",
    __image_alt__: "Agent 平台架构图",
  })

const ValuePointSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(20)
    .default("价值亮点"),
  description: z
    .string()
    .min(10)
    .max(400)
    .default(
      "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。"
    ),
})

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(20)
      .default("Agent 平台架构图")
      .meta({ description: "顶部蓝色条中的页面标题" }),
    agentImage: AgentImageSchema,
    rightPanelTitle: z
      .string()
      .min(2)
      .max(10)
      .default("价值亮点")
      .meta({ description: "右侧蓝色条标题" }),
    valuePoints: z
      .array(ValuePointSchema)
      .length(3)
      .default([
        {
          title: "价值亮点一",
          description:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "价值亮点二",
          description:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "价值亮点三",
          description:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
      ]),
  })
  .default({
    pageTitle: "Agent 平台架构图",
    agentImage: AgentImageSchema.parse({}),
    rightPanelTitle: "价值亮点",
    valuePoints: [
      {
        title: "价值亮点一",
        description:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "价值亮点二",
        description:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "价值亮点三",
        description:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide10Props {
  data?: Partial<SlideData>
}

const Slide10: React.FC<Slide10Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    agentImage: {
      ...base.agentImage,
      ...(data?.agentImage || {}),
    },
    valuePoints: data?.valuePoints
      ? data.valuePoints.map((v, i) => ({ ...base.valuePoints[i], ...v }))
      : base.valuePoints,
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

        {/* 主体区域：左侧 Agent 架构图 + 右侧价值亮点说明 */}
        <div className="flex px-10 pt-6 pb-4 gap-6 h-[520px]">
          {/* 左侧大图 */}
          <div className="w-[65%] h-full flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-md overflow-hidden flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
              <img
                src={slideData.agentImage.__image_url__}
                alt={slideData.agentImage.__image_alt__}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 右侧价值亮点卡片区域 */}
          <div className="flex-1 flex flex-col">
            {/* 上方蓝色标题条 */}
            <div
              className="px-6 py-3 rounded-t-md"
              style={{ backgroundColor: "#0066B3" }}
            >
              <div className="text-[24px] font-semibold text-white">
                {slideData.rightPanelTitle}
              </div>
            </div>
            {/* 下方灰白背景中的三段说明 */}
            <div className="flex-1 bg-[#F5F7FA] px-6 py-4 space-y-4 rounded-b-md border border-[#E5E7EB]">
              {slideData.valuePoints.map((vp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[18px] font-semibold text-[#111827]">
                    {vp.title}
                  </div>
                  <div className="text-[16px] leading-[1.8] text-[#4B5563]">
                    {vp.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部条幅图片（与第七页一致，使用公司条幅） */}
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

export default Slide10



