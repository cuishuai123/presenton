import React from "react"
import * as z from "zod"

export const layoutId = "powerchina-positioning-slide-7"
export const layoutName = "PowerChina Platform Positioning"
export const layoutDescription =
  "平台定位页：左侧整幅示意图，右侧四个用户类型说明卡片，底部公司条幅图片"

const LeftImageSchema = z
  .object({
    __image_url__: z
      .string()
      .url()
      .default(
        `/app_data/images/powerchina/silde_4.png`
      )
      .describe("左侧平台定位示意图 URL"),
    __image_alt__: z
      .string()
      .min(0)
      .max(120)
      .default("平台定位示意图")
      .describe("左侧图片替代文本"),
  })
  .default({
    __image_url__: `/app_data/images/powerchina/silde_4.png`,
    __image_alt__: "平台定位示意图",
  })

const UserTierSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(20)
    .default("用户类型")
    .describe("右侧卡片中的用户类型标题"),
  paragraph: z
    .string()
    .min(10)
    .max(400)
    .default(
      "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。"
    )
    .describe("对应用户类型的说明文本，全部为模板占位文字。"),
})

export const Schema = z
  .object({
    pageTitle: z
      .string()
      .min(2)
      .max(20)
      .default("平台定位")
      .meta({ description: "顶部蓝色条中的页面标题" }),
    leftImage: LeftImageSchema,
    userTiers: z
      .array(UserTierSchema)
      .length(4)
      .default([
        {
          title: "基础用户",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "知识增强用户",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "流程构建用户",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
        {
          title: "高级开发用户",
          paragraph:
            "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
        },
      ]),
  })
  .default({
    pageTitle: "平台定位",
    leftImage: LeftImageSchema.parse({}),
    userTiers: [
      {
        title: "基础用户",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "知识增强用户",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "流程构建用户",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
      {
        title: "高级开发用户",
        paragraph:
          "这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字，这里是模板文字。",
      },
    ],
  })

type SlideData = z.infer<typeof Schema>

interface Slide7Props {
  data?: Partial<SlideData>
}

const Slide7: React.FC<Slide7Props> = ({ data }) => {
  const base = Schema.parse({})
  const slideData: SlideData = {
    ...base,
    ...data,
    leftImage: {
      ...base.leftImage,
      ...(data?.leftImage || {}),
    },
    userTiers: data?.userTiers
      ? data.userTiers.map((tier, i) => ({ ...base.userTiers[i], ...tier }))
      : base.userTiers,
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

        {/* 中部区域：左侧整幅图片 + 右侧四个用户类型卡片 */}
        <div className="flex px-10 pt-6 pb-4 gap-6 h-[520px]">
          {/* 左侧图片 */}
          <div className="w-[45%] h-full flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-md overflow-hidden flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] relative">
              {/* 底图 */}
              <img
                src={slideData.leftImage.__image_url__}
                alt={slideData.leftImage.__image_alt__}
                className="w-full h-full object-contain"
              />
              {/* 叠加的浅蓝色圆圈 + 文字“满足 不同用户需求” */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-[320px] h-[320px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#E6F2FF" }}
                >
                  <div
                    className="w-[220px] h-[220px] rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#3C7FD1" }}
                  >
                    <div className="text-center text-white font-semibold leading-snug text-[28px]">
                      满足
                      <br />
                      不同用户需求
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧用户类型说明卡片（上下排列 4 个） */}
          <div className="flex-1 flex flex-col justify-between gap-3">
            {slideData.userTiers.map((tier, idx) => {
              const colors = [
                "#4A90E2", // 蓝
                "#D0021B", // 红
                "#4A90E2", // 蓝
                "#D0021B", // 红
              ]
              const bg = colors[idx] || "#4A90E2"
              return (
                <div
                  key={idx}
                  className="flex flex-col rounded-full px-8 py-3"
                  style={{ backgroundColor: bg }}
                >
                  <div className="text-[22px] font-semibold text-white mb-1">
                    {tier.title}
                  </div>
                  <div className="text-[16px] leading-[1.7] text-white">
                    {tier.paragraph}
                  </div>
                </div>
              )
            })}
          </div>
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

export default Slide7



