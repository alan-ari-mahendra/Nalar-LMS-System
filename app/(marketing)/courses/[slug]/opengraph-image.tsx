import { ImageResponse } from "next/og"
import { getCourseBySlug } from "@/lib/queries"

export const alt = "Course on Learnify"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function CourseOG({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug)
  const title = course?.title ?? "Course"
  const instructor = course?.instructor.fullName ?? ""
  const category = course?.category.name ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#a78bfa",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              color: "#0a0012",
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#fafafa",
              letterSpacing: "-0.03em",
            }}
          >
            Learnify
          </div>
        </div>

        {category && (
          <div
            style={{
              marginTop: "auto",
              fontSize: "20px",
              color: "#a78bfa",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "flex",
            }}
          >
            {category}
          </div>
        )}

        <div
          style={{
            fontSize: "60px",
            fontWeight: 800,
            color: "#fafafa",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginTop: "16px",
            display: "flex",
          }}
        >
          {title.length > 80 ? title.slice(0, 80) + "..." : title}
        </div>

        {instructor && (
          <div
            style={{
              marginTop: "20px",
              fontSize: "26px",
              color: "#a1a1aa",
              display: "flex",
            }}
          >
            By {instructor}
          </div>
        )}
      </div>
    ),
    size
  )
}
