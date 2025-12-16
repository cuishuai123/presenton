import React from "react"
import * as z from "zod"

export const layoutId = "template-slide-demo-28"
export const layoutName = "Template Slide Demo Thanks"
export const layoutDescription =
  "感谢页：简洁优雅的感谢页面，中央感谢文字，底部示例条幅图片"

export const Schema = z
  .object({
    mainTitle: z
      .string()
      .min(2)
      .max(40)
      .default("感谢观看")
      .meta({ description: "主标题" }),
    subTitle: z
      .string()
      .min(2)
      .max(60)
      .default("THANK YOU")
      .meta({ description: "英文副标题" }),
    thankYouText: z
      .string()
      .min(10)
      .max(200)
      .default("感谢您的关注与支持，期待与您进一步交流合作。")
      .meta({ description: "感谢文字" }),
    contactInfo: z
      .string()
      .min(0)
      .max(100)
      .default("示例联系方式：example@example.com")
      .meta({ description: "联系方式（可选）" }),
  })
  .default({
    mainTitle: "感谢观看",
    subTitle: "THANK YOU",
    thankYouText: "感谢您的关注与支持，期待与您进一步交流合作。",
    contactInfo: "示例联系方式：example@example.com",
  })

type SlideData = z.infer<typeof Schema>

interface Slide28Props {
  data?: Partial<SlideData>
}

const Slide28: React.FC<Slide28Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
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
        {/* 顶部标题栏 */}
        <div
          className="h-[72px] w-full flex items-center px-10"
          style={{ backgroundColor: "#0066B3" }}
        >
          <div className="text-[32px] font-semibold text-white">
            {slideData.mainTitle}
          </div>
        </div>

        {/* 主体内容区域 */}
        <div className="px-12 py-20 flex flex-col items-center justify-center min-h-[520px]">
          {/* 中央感谢区域 */}
          <div className="flex flex-col items-center">
            {/* 英文副标题 */}
            <div className="text-[42px] font-semibold text-[#0066B3] mb-6 tracking-wider">
              {slideData.subTitle}
            </div>

            {/* 装饰性分隔线 */}
            <div className="w-40 h-1 bg-gradient-to-r from-transparent via-[#0066B3] to-transparent mb-10" />

            {/* 感谢文字 */}
            <div className="text-[32px] text-[#1F2937] leading-relaxed text-center max-w-2xl font-medium">
              {slideData.thankYouText}
            </div>

            {/* 联系方式（如果有） */}
            {slideData.contactInfo && (
              <div className="text-[18px] text-[#4B5563] mt-12">
                {slideData.contactInfo}
              </div>
            )}

            {/* 装饰性元素：三个渐变圆点 */}
            <div className="flex gap-4 mt-16">
              <div
                className="w-4 h-4 rounded-full shadow-md"
                style={{ backgroundColor: "#0066B3" }}
              />
              <div
                className="w-4 h-4 rounded-full shadow-md"
                style={{ backgroundColor: "#0066B3", opacity: 0.7 }}
              />
              <div
                className="w-4 h-4 rounded-full shadow-md"
                style={{ backgroundColor: "#0066B3", opacity: 0.4 }}
              />
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

export default Slide28

