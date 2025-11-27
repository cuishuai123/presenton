import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-data-architecture-slide-11"
export const layoutName = "PowerChina Data Architecture"
export const layoutDescription =
  "数据架构图页：顶部蓝色标题栏，左侧整幅数据架构图，右侧为分点说明文字，底部公司条幅图片"

const DataImageSchema = z
  .object({
    __image_url__: z
      .string()
      .url()
      .default("/app_data/images/powerchina/data_architecture.png")
      .describe("左侧数据架构示意图 URL，可替换为本地导出的截图"),
    __image_alt__: z
      .string()
      .min(0)
      .max(160)
      .default("数据架构图")
      .describe("左侧图片替代文本"),
  })
  .default({
    __image_url__: "/app_data/images/powerchina/data_architecture.png",
    __image_alt__: "数据架构图",
  })

const BulletSchema = z.object({
  text: z
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
      .default("数据架构")
      .meta({ description: "顶部蓝色条中的页面标题" }),
    dataImage: DataImageSchema,
    bullets: z
      .array(BulletSchema)
      .length(3)
      .default([
        {
          text: "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          text: "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          text: "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
      ]),
  })
  .default({
    pageTitle: "数据架构",
    dataImage: DataImageSchema.parse({}),
    bullets: [
      {
        text: "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        text: "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        text: "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide11Props {
  data?: Partial<SlideData>
}

const Slide11: React.FC<Slide11Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    dataImage: {
      ...base.dataImage,
      ...(data?.dataImage || {}),
    },
    bullets: data?.bullets
      ? data.bullets.map((b, i) => ({ ...base.bullets[i], ...b }))
      : base.bullets,
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

        {/* 主体区域：左侧数据架构图 + 右侧分点说明 */}
        <div className="flex px-10 pt-6 pb-4 gap-6 h-[520px]">
          {/* 左侧大图 */}
          <div className="w-[65%] h-full flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-md overflow-hidden flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
              <img
                src={slideData.dataImage.__image_url__}
                alt={slideData.dataImage.__image_alt__}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 右侧说明列表（仿 PPT 右侧文字块） */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-4 text-[18px] leading-[1.8] text-[#4B5563]">
              {slideData.bullets.map((b, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#EF476F]" />
                  <span>{b.text}</span>
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

export default Slide11



