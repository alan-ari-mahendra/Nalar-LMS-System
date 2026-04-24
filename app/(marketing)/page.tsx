import Link from "next/link"
import Image from "next/image"
import { CourseCard } from "@/components/course/CourseCard"
import { Avatar } from "@/components/shared/Avatar"
import { RatingStars } from "@/components/shared/RatingStars"
import { MOCK_TESTIMONIALS } from "@/mock/data"
import { getFeaturedCourses } from "@/lib/queries"

export default async function LandingPage() {
  const featuredCourses = await getFeaturedCourses(3)
  return (
    <>
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative pt-16 pb-20 overflow-hidden grid-bg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            {/* Announcement badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant text-xs font-medium text-primary mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              New: Full-stack AI Engineer Path
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.1]">
              Learn skills that <span className="text-primary">matter</span>. At your own pace.
            </h1>

            <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Access high-quality courses from industry experts. Master the tools and technologies used by world-class engineering teams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(167,139,250,0.3)] transition-all"
              >
                Browse Courses
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <button className="border border-outline-variant bg-surface-container-low text-on-surface px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined">play_circle</span>
                Watch Preview
              </button>
            </div>
          </div>

          {/* Floating course card mockup */}
          <div className="relative">
            <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 shadow-2xl relative z-10">
              <div className="aspect-video bg-surface-container-highest rounded-lg mb-4 overflow-hidden">
                <Image
                  src={featuredCourses[0].thumbnailUrl}
                  alt={featuredCourses[0].title}
                  width={800}
                  height={450}
                  className="w-full h-full object-cover grayscale opacity-60"
                  priority
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 bg-tertiary-container text-tertiary text-[10px] font-bold uppercase tracking-wider rounded">
                  {featuredCourses[0].level}
                </span>
                <RatingStars rating={featuredCourses[0].rating} size="sm" />
              </div>
              <h3 className="text-xl font-bold mb-2">{featuredCourses[0].title}</h3>
              <div className="flex items-center gap-3">
                <Avatar
                  src={featuredCourses[0].instructor.avatarUrl}
                  name={featuredCourses[0].instructor.fullName}
                  size="sm"
                />
                <span className="text-sm text-on-surface-variant">
                  by {featuredCourses[0].instructor.fullName}
                </span>
              </div>
            </div>
            {/* Decorative glow blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-tertiary/10 rounded-full blur-[100px]" />
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS BAR
          ============================================================ */}
      <section className="bg-surface-bright border-y border-outline-variant">
        <div className="max-w-7xl mx-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
            <div className="flex flex-col items-center md:border-r border-outline-variant">
              <span className="text-3xl font-extrabold text-on-surface">12,000+</span>
              <span className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mt-1">Students</span>
            </div>
            <div className="flex flex-col items-center md:border-r border-outline-variant">
              <span className="text-3xl font-extrabold text-on-surface">200+</span>
              <span className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mt-1">Expert Courses</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-tertiary">98%</span>
              <span className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mt-1">Completion Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED COURSES
          ============================================================ */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter mb-4">Featured Courses</h2>
            <p className="text-on-surface-variant">Our most popular paths chosen by top industry pros.</p>
          </div>
          <Link
            href="/courses"
            className="text-primary font-bold flex items-center gap-1 hover:underline underline-offset-4"
          >
            View All <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
          ============================================================ */}
      <section className="py-24 bg-surface-container-low border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tighter mb-4">Your Journey to Mastery</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              A streamlined process designed to help you go from novice to professional without the noise.
            </p>
          </div>
          <div className="relative flex flex-col md:flex-row gap-12 md:gap-0 justify-between items-start">
            {/* Dotted connection line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px dotted-line opacity-30" />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center md:w-1/3 px-6">
              <div className="w-24 h-24 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center mb-8 shadow-xl hover:border-primary transition-colors">
                <span className="material-symbols-outlined !text-4xl text-primary">search</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Browse</h4>
              <p className="text-on-surface-variant text-sm">
                Explore our catalog of 200+ courses across various tech stacks and professional disciplines.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center md:w-1/3 px-6">
              <div className="w-24 h-24 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center mb-8 shadow-xl hover:border-primary transition-colors">
                <span className="material-symbols-outlined !text-4xl text-primary">app_registration</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Enroll</h4>
              <p className="text-on-surface-variant text-sm">
                Get instant lifetime access to high-quality video content, exercises, and community support.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center md:w-1/3 px-6">
              <div className="w-24 h-24 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center mb-8 shadow-xl hover:border-primary transition-colors">
                <span className="material-symbols-outlined !text-4xl text-primary">workspace_premium</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Learn &amp; Earn</h4>
              <p className="text-on-surface-variant text-sm">
                Complete projects, earn verified certificates, and unlock new career opportunities in tech.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
          ============================================================ */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter mb-16 text-center">
            Loved by the next generation of engineers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_TESTIMONIALS.map((testimonial, i) => (
              <div
                key={testimonial.id}
                className={`p-8 rounded-2xl bg-surface-container border border-outline-variant relative ${
                  i === 1 ? "md:mt-12" : ""
                }`}
              >
                <span className="material-symbols-outlined text-primary/20 absolute top-6 right-8 !text-6xl">
                  format_quote
                </span>
                <p className="text-on-surface mb-8 relative z-10 italic leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Avatar src={testimonial.avatarUrl} name={testimonial.authorName} size="md" />
                  <div>
                    <p className="font-bold">{testimonial.authorName}</p>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                      {testimonial.authorRole} @ {testimonial.authorCompany}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA BANNER
          ============================================================ */}
      <section className="px-6 mb-24">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-primary-container to-primary relative p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-zinc-950/20" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-zinc-50 mb-6">
              Start learning today — it&apos;s free to join.
            </h2>
            <p className="text-primary-fixed text-lg max-w-2xl mx-auto mb-10 opacity-90">
              Join 12,000+ students already mastering the future. Unlock our community and free resources instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-zinc-50 text-zinc-950 px-8 py-4 rounded-xl font-bold hover:bg-zinc-200 transition-all"
              >
                Create Free Account
              </Link>
              <Link
                href="/courses"
                className="bg-zinc-950/20 border border-zinc-50/20 backdrop-blur-md text-zinc-50 px-8 py-4 rounded-xl font-bold hover:bg-zinc-950/40 transition-all"
              >
                Explore Membership
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
