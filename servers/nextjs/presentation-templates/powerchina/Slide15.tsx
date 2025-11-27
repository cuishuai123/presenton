import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-overview-slide-15"
export const layoutName = "PowerChina Construction Overview"
export const layoutDescription =
  "建设内容总览页：顶部蓝色标题栏，中部一个橙色主模块和六个彩色功能模块卡片，底部公司条幅图片"

const MainModuleSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(40)
    .default("西北院工程知识智能服务平台 - 六大模块架构"),
  subtitle: z
    .string()
    .min(2)
    .max(80)
    .default("集知识管理、智能交互、应用开发与资源共享于一体的综合性智能服务平台"),
})

const ModuleSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(20)
    .default("模块标题"),
  description: z
    .string()
    .min(2)
    .max(40)
    .default("这里是模块描述"),
})

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(20)
      .default("建设内容总览")
      .meta({ description: "顶部蓝色条中的页面标题" }),
    mainModule: MainModuleSchema,
    modules: z
      .array(ModuleSchema)
      .length(6)
      .default([
        { title: "网址首页", description: "平台门户与信息窗口" },
        { title: "聊天交互", description: "核心人机交互界面" },
        { title: "工作台", description: "可视化智能体编排中心" },
        { title: "智能体应用中心", description: "预置与自定义应用的聚合地" },
        { title: "知识库管理", description: "企业与个人知识的大脑" },
        { title: "开发者集市", description: "开放的 AI 资源与能力生态" },
      ]),
  })
  .default({
    pageTitle: "建设内容总览",
    mainModule: {
      title: "西北院工程知识智能服务平台 - 六大模块架构",
      subtitle:
        "集知识管理、智能交互、应用开发与资源共享于一体的综合性智能服务平台",
    },
    modules: [
      { title: "网址首页", description: "平台门户与信息窗口" },
      { title: "聊天交互", description: "核心人机交互界面" },
      { title: "工作台", description: "可视化智能体编排中心" },
      { title: "智能体应用中心", description: "预置与自定义应用的聚合地" },
      { title: "知识库管理", description: "企业与个人知识的大脑" },
      { title: "开发者集市", description: "开放的 AI 资源与能力生态" },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide15Props {
  data?: Partial<SlideData>
}

const Slide15: React.FC<Slide15Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    modules: data?.modules
      ? data.modules.map((m, i) => ({ ...base.modules[i], ...m }))
      : base.modules,
  }

  const colors = [
    "from-[#3B82F6] to-[#2563EB]", // 蓝
    "from-[#10B981] to-[#059669]", // 绿
    "from-[#8B5CF6] to-[#6366F1]", // 紫
    "from-[#EC4899] to-[#F97316]", // 粉
    "from-[#F59E0B] to-[#F97316]", // 橙
    "from-[#1D4ED8] to-[#1E40AF]", // 深蓝
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
        {/* 顶部整条深蓝标题栏 */}
        <div
          className="h-[72px] w-full flex items-center px-10"
          style={{ backgroundColor: "#0066B3" }}
        >
          <div className="text-[36px] font-semibold text-white">
            {slideData.pageTitle}
          </div>
        </div>

        {/* 中部模块结构 */}
        <div className="px-12 pt-8 pb-4 flex flex-col items-center">
          {/* 中间主模块（橙色条） */}
          <div className="mb-8">
            <div className="rounded-3xl px-16 py-6 bg-gradient-to-r from-[#F97316] to-[#EF4444] shadow-[0_12px_30px_rgba(0,0,0,0.2)] text-center text-white">
              <div className="text-[26px] font-semibold mb-2">
                {slideData.mainModule.title}
              </div>
              <div className="text-[18px]">
                {slideData.mainModule.subtitle}
              </div>
            </div>
          </div>

          {/* 下方六个功能模块卡片 */}
          <div className="w-full flex flex-col gap-8">
            {/* 第一行 3 个 */}
            <div className="flex justify-between px-10">
              {slideData.modules.slice(0, 3).map((m, idx) => (
                <div
                  key={idx}
                  className={`w-[28%] rounded-3xl px-8 py-6 bg-gradient-to-br ${
                    colors[idx]
                  } shadow-[0_10px_24px_rgba(0,0,0,0.18)] text-white text-center`}
                >
                  <div className="text-[22px] font-semibold mb-2">
                    {m.title}
                  </div>
                  <div className="text-[16px]">{m.description}</div>
                </div>
              ))}
            </div>
            {/* 第二行 3 个 */}
            <div className="flex justify-between px-10">
              {slideData.modules.slice(3, 6).map((m, idx) => {
                const colorIdx = idx + 3
                return (
                  <div
                    key={colorIdx}
                    className={`w-[28%] rounded-3xl px-8 py-6 bg-gradient-to-br ${
                      colors[colorIdx]
                    } shadow-[0_10px_24px_rgba(0,0,0,0.18)] text-white text-center`}
                  >
                    <div className="text-[22px] font-semibold mb-2">
                      {m.title}
                    </div>
                    <div className="text-[16px]">{m.description}</div>
                  </div>
                )
              })}
            </div>
          </div>
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

export default Slide15



