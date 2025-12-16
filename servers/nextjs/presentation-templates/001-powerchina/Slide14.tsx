import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-section-slide-3"
export const layoutName = "PowerChina Section Cover"
export const layoutDescription =
  "章节封面：继承目录背景，左上“目 录 / CONTENTS”，中间蓝色圆形序号 + 章节标题 + 虚线分隔"

const BackgroundImageSchema = z
  .object({
    __image_url__: z
      .string()
      .url()
      .default("/app_data/images/powerchina/slide_2.png")
      .describe("章节封面背景图片 URL（默认与目录页相同）"),
    __image_prompt__: z
      .string()
      .min(0)
      .max(200)
      .default("PowerChina section cover slide background")
      .describe("背景图描述"),
  })
  .default({
    __image_url__: "/app_data/images/powerchina/slide_2.png",
    __image_prompt__: "PowerChina section cover slide background",
  })

export const Schema = z
  .object({
    headingCn: z
      .string()
      .min(2)
      .max(10)
      .default("目 录")
      .meta({ description: "左上中文大标题" }),
    headingEn: z
      .string()
      .min(2)
      .max(20)
      .default("CONTENTS")
      .meta({ description: "左上英文副标题" }),
    circleLabel: z
      .string()
      .min(1)
      .max(4)
      .default("三")
      .meta({ description: "蓝色圆中的章节序号，例如“三”“三”“1”" }),
    sectionTitle: z
      .string()
      .min(2)
      .max(40)
      .default("目录三")
      .meta({ description: "圆形下方的大章节标题" }),
    backgroundImage: BackgroundImageSchema,
  })
  .default({
    headingCn: " ",
    headingEn: " ",
    circleLabel: "三",
    sectionTitle: "目录三",
    backgroundImage: BackgroundImageSchema.parse({}),
  })

type SlideData = z.infer<typeof Schema>

interface Slide3Props {
  data?: Partial<SlideData>
}

const Slide3: React.FC<Slide3Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    // 背景图固定与目录页三致，不允许外部数据覆盖
    backgroundImage: base.backgroundImage,
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
        {/* 背景图，沿用目录页 */}
        <img
          src={slideData.backgroundImage.__image_url__}
          alt={slideData.backgroundImage.__image_prompt__}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 内容层 */}
        <div className="absolute inset-0 flex flex-col px-16 pt-24 pb-24">
   
          {/* 中央章节标识 */}
          <div
            className="flex-1 flex flex-col items-center justify-center"
            style={{ marginTop: "-120px" }}
          >
            {/* 蓝色圆形序号 */}
            <div className="mb-10">
              <div
                className="w-[180px] h-[180px] rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
                style={{ backgroundColor: "#0066B3" }}
              >
                <span
                  className="text-[80px] font-bold leading-none text-white"
                  style={{ textShadow: "0 4px 10px rgba(0,0,0,0.3)" }}
                >
                  {slideData.circleLabel}
                </span>
              </div>
            </div>

            {/* 章节标题 */}
            <div
              className="text-[52px] font-semibold mb-6"
              style={{ color: "var(--text-heading-color,#111827)" }}
            >
              {slideData.sectionTitle}
            </div>

            {/* 下方虚线分隔线 */}
            <div className="w-full mt-4">
              <div
                className="border-t border-dashed"
                style={{ borderColor: "rgba(0,0,0,0.4)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Slide3


