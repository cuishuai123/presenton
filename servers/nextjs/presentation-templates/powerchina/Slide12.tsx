import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-security-architecture-slide-12"
export const layoutName = "PowerChina Security Architecture"
export const layoutDescription =
  "安全架构页：顶部蓝色标题栏，左侧整幅安全架构图，右侧为详细说明文字，底部公司条幅图片"

const SecurityImageSchema = z
  .object({
    __image_url__: z
      .string()
      .url()
      .default("/app_data/images/powerchina/security_architecture.png")
      .describe("左侧安全架构示意图 URL，可替换为本地导出的截图"),
    __image_alt__: z
      .string()
      .min(0)
      .max(160)
      .default("平台安全架构图")
      .describe("左侧图片替代文本"),
  })
  .default({
    __image_url__: "/app_data/images/powerchina/security_architecture.png",
    __image_alt__: "平台安全架构图",
  })

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(20)
      .default("安全架构")
      .meta({ description: "顶部蓝色条中的页面标题" }),
    securityImage: SecurityImageSchema,
    rightDescription: z
      .string()
      .min(40)
      .max(1200)
      .default(
        "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。"
      )
      .meta({ description: "右侧安全架构文字说明，大段落，可分多行展示" }),
  })
  .default({
    pageTitle: "安全架构",
    securityImage: SecurityImageSchema.parse({}),
    rightDescription:
      "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
  })

type SlideData = z.infer<typeof Schema>

interface Slide12Props {
  data?: Partial<SlideData>
}

const Slide12: React.FC<Slide12Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    securityImage: {
      ...base.securityImage,
      ...(data?.securityImage || {}),
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

        {/* 主体区域：左侧安全架构图 + 右侧文字说明 */}
        <div className="flex px-10 pt-6 pb-4 gap-6 h-[520px]">
          {/* 左侧大图（带红色虚线边界在图片内） */}
          <div className="w-[65%] h-full flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-md overflow-hidden flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
              <img
                src={slideData.securityImage.__image_url__}
                alt={slideData.securityImage.__image_alt__}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 右侧说明文字块 */}
          <div className="flex-1 flex items-center">
            <div
              className="text-[18px] leading-[1.9]"
              style={{ color: "var(--text-body-color,#333333)" }}
            >
              {slideData.rightDescription}
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

export default Slide12



