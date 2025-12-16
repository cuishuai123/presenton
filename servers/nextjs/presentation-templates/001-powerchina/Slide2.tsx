import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-contents-slide-2"
export const layoutName = "PowerChina Contents"
export const layoutDescription = "目录页：左侧大标题 + 右侧 6 条章节列表，使用灰色背景图"

const BackgroundImageSchema = z
  .object({
    __image_url__: z
      .string()
      .url()
      .default(
        "/app_data/images/powerchina/slide_2.png"
      )
      .describe("目录页背景图片 URL"),
    __image_prompt__: z
      .string()
      .min(0)
      .max(200)
      .default("PowerChina contents slide background")
      .describe("背景图描述"),
  })
  .default({
    __image_url__:
      "/app_data/images/powerchina/slide_2.png",
    __image_prompt__: "PowerChina contents slide background",
  })

const SectionSchema = z.object({
  indexLabel: z
    .string()
    .min(1)
    .max(4)
    .default("一、")
    .describe("序号前缀，如“一、”"),
  title: z
    .string()
    .min(2)
    .max(40)
    .default("目录一")
    .describe("章节标题"),
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
    backgroundImage: BackgroundImageSchema,
    sections: z
      .array(SectionSchema)
      .length(6)
      .default([
        { indexLabel: "一、", title: "目录一" },
        { indexLabel: "二、", title: "目录二" },
        { indexLabel: "三、", title: "目录三" },
        { indexLabel: "四、", title: "目录四" },
        { indexLabel: "五、", title: "目录五" },
        { indexLabel: "六、", title: "目录六" },
      ]),
  })
  .default({
    headingCn: "",
    headingEn: "",
    backgroundImage: BackgroundImageSchema.parse({}),
    sections: [
      { indexLabel: "一、", title: "目录一" },
      { indexLabel: "二、", title: "目录二" },
      { indexLabel: "三、", title: "目录三" },
      { indexLabel: "四、", title: "目录四" },
      { indexLabel: "五、", title: "目录五" },
      { indexLabel: "六、", title: "目录六" },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide2Props {
  data?: Partial<SlideData>
}

const Slide2: React.FC<Slide2Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    // 背景图固定使用模板自带的灰色背景，不从外部数据覆盖，避免被其他截图替换
    backgroundImage: base.backgroundImage,
    sections: data?.sections
      ? data.sections.map((s, i) => ({ ...base.sections[i], ...s }))
      : base.sections,
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
        {/* 背景图 */}
        <img
          src={slideData.backgroundImage.__image_url__}
          alt={slideData.backgroundImage.__image_prompt__}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 内容层 */}
        <div className="absolute inset-0 flex px-16 pt-24 pb-16">
          {/* 左侧标题区域 */}
          <div className="w-[34%] pr-8 flex flex-col justify-start">
            {/* 横线 + 竖线装饰 */}
       
          </div>

          {/* 右侧章节列表 */}
          <div className="flex-1 flex items-center">
            <div className="w-full pl-8">
              <div className="space-y-4 text-[26px] leading-[1.6]">
                {slideData.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4"
                    style={{ color: "var(--text-heading-color,#333333)" }}
                  >
                    <span className="whitespace-nowrap font-semibold">
                      {sec.indexLabel}
                    </span>
                    <span>{sec.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Slide2
