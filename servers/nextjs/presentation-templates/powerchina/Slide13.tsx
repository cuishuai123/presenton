import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-roadmap-slide-13"
export const layoutName = "PowerChina Construction Roadmap"
export const layoutDescription =
  "建设路线页：顶部蓝色标题栏，上半部分为一期建设内容蓝灰双色大框，下半部分为二期展望文字说明，底部公司条幅图片"

const PhaseBlockSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(30)
    .default("平台基座"),
  lines: z
    .array(
      z
        .string()
        .min(2)
        .max(60)
        .default("这里是模板文字，这里是模板文字，这里是模板文字")
    )
    .length(4)
    .default([
      "统一数据中台、模型管理、向量检索、权限与审计框架",
      "采用云原生微服务 + K8s 部署，确保弹性伸缩",
      "这里是模板文字，这里是模板文字，这里是模板文字",
      "这里是模板文字，这里是模板文字，这里是模板文字",
    ]),
})

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(20)
      .default("建设路线")
      .meta({ description: "顶部蓝色条中的页面标题" }),
    phaseOneTitle: z
      .string()
      .min(2)
      .max(60)
      .default("一期建设内容（2025.03 - 2026.12）—— 边开发边上线"),
    phaseOneLeft: PhaseBlockSchema,
    phaseOneRightTitle: z
      .string()
      .min(2)
      .max(10)
      .default("核心功能模块"),
    phaseOneRightLines: z
      .array(
        z
          .string()
          .min(2)
          .max(80)
          .default("这里是模板文字，这里是模板文字，这里是模板文字")
      )
      .length(6)
      .default([
        "信息门户（首页宣传页、更新日志、下载中心）",
        "大模型对话页面（模型/知识库切换、深度思考模式）",
        "智能体中心（预置 AI 写作、报告生成、模型生成等）",
        "知识库系统（文件上传、向量检索、边传边问）",
        "工作台画布（节点库、调试、版本管理）",
        "开发者集市（Prompt / 组件 / MCP / 知识库市场）",
      ]),
    phaseTwoTitle: z
      .string()
      .min(2)
      .max(60)
      .default("二期展望（2027 - 2028）—— 在一期基础之上持续进化"),
    phaseTwoDescription: z
      .string()
      .min(40)
      .max(800)
      .default(
        "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。"
      ),
  })
  .default({
    pageTitle: "建设路线",
    phaseOneTitle: "一期建设内容（2025.03 - 2026.12）—— 边开发边上线",
    phaseOneLeft: PhaseBlockSchema.parse({}),
    phaseOneRightTitle: "核心功能模块",
    phaseOneRightLines: [
      "信息门户（首页宣传页、更新日志、下载中心）", 
      "大模型对话页面（模型/知识库切换、深度思考模式）",
      "智能体中心（预置 AI 写作、报告生成、模型生成等）",
      "知识库系统（文件上传、向量检索、边传边问）",
      "工作台画布（节点库、调试、版本管理）",
      "开发者集市（Prompt / 组件 / MCP / 知识库市场）",
    ],
    phaseTwoTitle: "二期展望（2027 - 2028）—— 在一期基础之上持续进化",
    phaseTwoDescription:
      "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
  })

type SlideData = z.infer<typeof Schema>

interface Slide13Props {
  data?: Partial<SlideData>
}

const Slide13: React.FC<Slide13Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    phaseOneLeft: {
      ...base.phaseOneLeft,
      ...(data?.phaseOneLeft || {}),
    },
    phaseOneRightLines: data?.phaseOneRightLines
      ? data.phaseOneRightLines.map((l, i) => base.phaseOneRightLines[i] ?? l)
      : base.phaseOneRightLines,
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

        {/* 一期建设内容标题 */}
        <div className="px-12 pt-6 pb-3 text-[22px] font-semibold text-[#111827]">
          <span className="inline-block w-3 h-3 rounded-full bg-black mr-2" />
          {slideData.phaseOneTitle}
        </div>

        {/* 中部蓝灰双色大框 */}
        <div className="px-12">
          <div className="flex rounded-3xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.15)] h-[360px]">
            {/* 左侧蓝色块：平台基座 */}
            <div
              className="w-1/2 px-10 py-8 text-white flex flex-col justify-center"
              style={{ backgroundColor: "#3366CC" }}
            >
              <div className="text-[26px] font-semibold mb-4">
                {slideData.phaseOneLeft.title}
              </div>
              <div className="space-y-2 text-[18px] leading-[1.8]">
                {slideData.phaseOneLeft.lines.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
            {/* 右侧灰色块：核心功能模块 */}
            <div className="w-1/2 bg-[#F5F7FA] px-10 py-8 flex flex-col justify-center">
              <div className="text-[22px] font-semibold text-[#CC3333] mb-4">
                {slideData.phaseOneRightTitle}
              </div>
              <div className="space-y-2 text-[18px] leading-[1.8] text-[#4B5563]">
                {slideData.phaseOneRightLines.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 二期展望标题与说明 */}
        <div className="px-12 pt-6 text-[22px] font-semibold text-[#111827]">
          <span className="inline-block w-3 h-3 rounded-full bg-black mr-2" />
          {slideData.phaseTwoTitle}
        </div>
        <div className="px-16 pt-2 pb-4 text-[18px] leading-[1.8] text-[#4B5563]">
          {slideData.phaseTwoDescription}
        </div>

        {/* 底部条幅图片（公司条幅） */}
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

export default Slide13



