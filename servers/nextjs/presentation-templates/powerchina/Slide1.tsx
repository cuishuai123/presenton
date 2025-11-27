import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-intro-slide-1"
export const layoutName = "PowerChina Intro"
export const layoutDescription = "中国电建项目封面：使用整幅背景图 + 中央标题 + 右下角项目信息"

// 背景图配置（建议将图片放到 public 目录并更新 URL）
const BackgroundImageSchema = z
  .object({
    __image_url__: z
      .string()
      .url()
      
      .default(
        "/app_data/images/powerchina/slide_1.png"
      )
      .describe("整幅背景图片 URL"),
    __image_prompt__: z
      .string()
      .min(0)
      .max(200)
      .default("PowerChina intro slide background")
      .describe("背景图描述/提示"),
  })
  .default({
    __image_url__:
      "/app_data/images/powerchina/slide_1.png",
    __image_prompt__: "PowerChina intro slide background",
  })

export const Schema = z
  .object({
    projectNameEn: z
      .string()
      .min(2)
      .max(80)
      .default("Project Name")
      .meta({ description: "中央英文项目名称" }),
    projectNameCn: z
      .string()
      .min(2)
      .max(40)
      .default("项目名称")
      .meta({ description: "中央中文项目名称" }),
    dateText: z
      .string()
      .min(2)
      .max(40)
      .default("20XX年XX月")
      .meta({ description: "右下角日期" }),
    organization: z
      .string()
      .min(2)
      .max(80)
      .default("XXXXXX院")
      .meta({ description: "右下角单位/部门名称" }),
    backgroundImage: BackgroundImageSchema,
  })
  .default({
    projectNameEn: "Project Name",
    projectNameCn: "项目名称",
    dateText: "20XX年XX月",
    organization: "XXXXXX院",
    backgroundImage: BackgroundImageSchema.parse({}),
  })

type SlideData = z.infer<typeof Schema>

interface Slide1Props {
  data?: Partial<SlideData>
}

const Slide1: React.FC<Slide1Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    backgroundImage: {
      ...base.backgroundImage,
      ...(data?.backgroundImage || {}),
    },
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full rounded-sm max-w-[1280px] shadow-lg max-h-[720px] aspect-video relative z-20 mx-auto overflow-hidden"
        style={{
          fontFamily: "var(--heading-font-family,Albert Sans)",
          backgroundColor: "var(--card-background-color,#FFFFFF)",
        }}
      >
        {/* 整幅背景图 */}
        <img
          src={slideData.backgroundImage.__image_url__}
          alt={slideData.backgroundImage.__image_prompt__}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 半透明层（可选，让文字更清晰） */}
        <div className="absolute inset-0 bg-black/0" />

        {/* 中央标题区域 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <div
            className="text-[52px] font-semibold tracking-wide mb-4"
            style={{ color: "#FFFFFF", textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
          >
            {slideData.projectNameEn}
          </div>
          <div
            className="text-[46px] font-semibold"
            style={{ color: "#FFFFFF", textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
          >
            {slideData.projectNameCn}
          </div>
        </div>

        {/* 右下角日期 + 单位 */}
        <div className="absolute right-16 bottom-16 text-right space-y-3">
          <div
            className="text-[26px] font-medium"
            style={{ color: "#FFFFFF", textShadow: "0 3px 8px rgba(0,0,0,0.4)" }}
          >
            {slideData.dateText}
          </div>
          <div
            className="text-[24px]"
            style={{ color: "#FFFFFF", textShadow: "0 3px 8px rgba(0,0,0,0.4)" }}
          >
            {slideData.organization}
          </div>
        </div>
      </div>
    </>
  )
}

export default Slide1
