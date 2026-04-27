// prisma/seed.ts
// Seed database with rich, diverse mock data for development.
// Wipes ALL data first, then re-seeds.
// Run: npx prisma db seed   (or: pnpm prisma db seed)

import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { hashSync } from "bcryptjs"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ============================================================
// HELPERS
// ============================================================

const PASSWORD_HASH = hashSync("Password1", 12)

const SAMPLE_VIDEO = "https://media.w3.org/2010/05/sintel/trailer.mp4"

const NOW = new Date("2026-04-27T00:00:00Z")

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000)
}

function avatar(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
}

type LessonSpec = {
  title: string
  type?: "VIDEO" | "TEXT" | "QUIZ" | "ATTACHMENT"
  duration?: number
  isFree?: boolean
  description?: string
  content?: string
  videoUrl?: string | null
}

type ChapterSpec = {
  title: string
  description?: string
  isFree?: boolean
  lessons: LessonSpec[]
}

async function createCurriculum(courseId: string, chapters: ChapterSpec[]) {
  const createdLessons: { id: string; title: string; type: string }[] = []
  for (let chapterIdx = 0; chapterIdx < chapters.length; chapterIdx++) {
    const ch = chapters[chapterIdx]
    const chapter = await prisma.chapter.create({
      data: {
        title: ch.title,
        description: ch.description ?? null,
        position: chapterIdx + 1,
        isFree: ch.isFree ?? false,
        courseId,
        lessons: {
          create: ch.lessons.map((l, idx) => ({
            title: l.title,
            type: l.type ?? "VIDEO",
            position: idx + 1,
            isFree: l.isFree ?? false,
            duration: l.duration ?? null,
            description: l.description ?? null,
            content: l.content ?? null,
            videoUrl:
              l.videoUrl === undefined && (l.type ?? "VIDEO") === "VIDEO"
                ? SAMPLE_VIDEO
                : (l.videoUrl ?? null),
          })),
        },
      },
      include: { lessons: { orderBy: { position: "asc" } } },
    })
    for (const lesson of chapter.lessons) {
      createdLessons.push({ id: lesson.id, title: lesson.title, type: lesson.type })
    }
  }

  // Recalculate cached counts on course
  const totalDuration = chapters
    .flatMap((c) => c.lessons.map((l) => l.duration ?? 0))
    .reduce((a, b) => a + b, 0)
  const totalLessons = chapters.reduce((sum, c) => sum + c.lessons.length, 0)
  await prisma.course.update({
    where: { id: courseId },
    data: { totalDuration, totalLessons },
  })
  return createdLessons
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("Wiping database...")
  // Order matters: respect FK direction. Cascade does most of it,
  // but explicit deletes keep behaviour predictable.
  await prisma.passwordResetToken.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.coupon.deleteMany() // orders.couponId is SetNull
  await prisma.user.deleteMany() // cascades sessions/courses/orders/etc
  await prisma.category.deleteMany()
  console.log("  Wiped clean")

  // ============================================================
  // USERS — 1 admin + 5 teachers + 12 students
  // ============================================================

  const admin = await prisma.user.create({
    data: {
      email: "mail.alanari@gmail.com",
      emailVerified: true,
      name: "Alan Ari (Admin)",
      avatarUrl: avatar("alan-admin"),
      headline: "Platform Administrator",
      role: "ADMIN",
      credentials: { create: { provider: "EMAIL", passwordHash: PASSWORD_HASH } },
    },
  })

  const rina = await prisma.user.create({
    data: {
      email: "rina@learnify.id",
      emailVerified: true,
      name: "Rina Maharani",
      avatarUrl: avatar("rina"),
      headline: "Senior Full-Stack Engineer",
      bio: "10+ years building products with React, Next.js, and Node. Ex-Tokopedia, ex-Gojek.",
      website: "https://rinamaharani.dev",
      role: "TEACHER",
      credentials: { create: { provider: "EMAIL", passwordHash: PASSWORD_HASH } },
    },
  })

  const budi = await prisma.user.create({
    data: {
      email: "budi@learnify.id",
      emailVerified: true,
      name: "Budi Santoso",
      avatarUrl: avatar("budi"),
      headline: "Product Designer & Educator",
      bio: "Design systems specialist. Helping teams ship cohesive products faster.",
      role: "TEACHER",
      credentials: { create: { provider: "EMAIL", passwordHash: PASSWORD_HASH } },
    },
  })

  const sari = await prisma.user.create({
    data: {
      email: "sari@learnify.id",
      emailVerified: true,
      name: "Sari Dewi",
      avatarUrl: avatar("sari"),
      headline: "Data Engineer @ Tiket.com",
      bio: "Builds petabyte-scale data platforms. Obsessed with reliable pipelines.",
      role: "TEACHER",
      credentials: { create: { provider: "EMAIL", passwordHash: PASSWORD_HASH } },
    },
  })

  const rizky = await prisma.user.create({
    data: {
      email: "rizky@learnify.id",
      emailVerified: true,
      name: "Rizky Firmansyah",
      avatarUrl: avatar("rizky"),
      headline: "DevOps & Platform Engineer",
      bio: "Containers, Kubernetes, and SRE. Helping startups stay up at 3 AM.",
      role: "TEACHER",
      credentials: { create: { provider: "EMAIL", passwordHash: PASSWORD_HASH } },
    },
  })

  const dewi = await prisma.user.create({
    data: {
      email: "dewi@learnify.id",
      emailVerified: true,
      name: "Dewi Kartika",
      avatarUrl: avatar("dewi"),
      headline: "Mobile Engineer (iOS / Android)",
      bio: "Shipping cross-platform apps with Flutter and React Native since 2018.",
      role: "TEACHER",
      credentials: { create: { provider: "EMAIL", passwordHash: PASSWORD_HASH } },
    },
  })

  const studentSpecs: { email: string; name: string; verified?: boolean }[] = [
    { email: "alan@example.com", name: "Alan Ari Mahendra", verified: true },
    { email: "aditya@example.com", name: "Aditya Pratama", verified: true },
    { email: "maya@example.com", name: "Maya Indira", verified: true },
    { email: "fajar@example.com", name: "Fajar Nugroho", verified: true },
    { email: "intan@example.com", name: "Intan Permata", verified: true },
    { email: "bagus@example.com", name: "Bagus Wicaksono", verified: true },
    { email: "citra@example.com", name: "Citra Lestari", verified: true },
    { email: "dimas@example.com", name: "Dimas Anggara", verified: true },
    { email: "eka@example.com", name: "Eka Wahyuni", verified: false },
    { email: "gita@example.com", name: "Gita Saraswati", verified: true },
    { email: "hadi@example.com", name: "Hadi Putranto", verified: true },
    { email: "joko@example.com", name: "Joko Prasetyo", verified: false },
  ]

  const students = await Promise.all(
    studentSpecs.map((s) =>
      prisma.user.create({
        data: {
          email: s.email,
          emailVerified: s.verified ?? true,
          name: s.name,
          avatarUrl: avatar(s.email),
          role: "STUDENT",
          credentials: {
            create: { provider: "EMAIL", passwordHash: PASSWORD_HASH },
          },
        },
      })
    )
  )
  const [
    alan,
    aditya,
    maya,
    fajar,
    intan,
    bagus,
    citra,
    dimas,
    eka,
    gita,
    hadi,
    joko,
  ] = students

  console.log(`  Users created (1 admin, 5 teachers, ${students.length} students)`)

  // ============================================================
  // CATEGORIES
  // ============================================================

  const catSpecs: { name: string; slug: string; description: string }[] = [
    { name: "Web Development", slug: "web-development", description: "Frontend & backend web development" },
    { name: "UI/UX Design", slug: "ui-ux-design", description: "User interface and experience design" },
    { name: "Data Science", slug: "data-science", description: "Data analysis, ML, and AI" },
    { name: "Mobile Development", slug: "mobile-development", description: "iOS and Android development" },
    { name: "DevOps & Cloud", slug: "devops", description: "CI/CD, containers, and infrastructure" },
    { name: "Cybersecurity", slug: "cybersecurity", description: "Application and network security" },
    { name: "AI & Machine Learning", slug: "ai-ml", description: "Modern AI, LLMs, and ML engineering" },
    { name: "Product Management", slug: "product-management", description: "Discovery, strategy, and shipping" },
  ]

  const categories = await Promise.all(
    catSpecs.map((c) => prisma.category.create({ data: c }))
  )
  const catBy = (slug: string) => {
    const c = categories.find((x) => x.slug === slug)
    if (!c) throw new Error(`Missing category ${slug}`)
    return c
  }

  console.log(`  Categories created (${categories.length})`)

  // ============================================================
  // COURSES
  // ============================================================

  type CourseInput = {
    title: string
    slug: string
    description: string
    shortDesc: string
    thumbnailUrl: string
    price: number
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
    status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED"
    requirements: string[]
    outcomes: string[]
    rating?: number
    reviewCount?: number
    enrollmentCount?: number
    publishedAgo?: number // days ago
    createdAgo: number
    instructorId: string
    categorySlug: string
    trailerUrl?: string
  }

  const courseInputs: CourseInput[] = [
    {
      title: "Next.js 15 — Build Full-Stack SaaS Applications",
      slug: "nextjs-15-fullstack-saas",
      description:
        "Master Next.js 15 App Router by building a production-grade SaaS application from scratch. Covers React Server Components, Server Actions, authentication, Prisma ORM, payments, and Vercel deployment.",
      shortDesc: "Build a production SaaS app with Next.js 15, Prisma, and Stripe.",
      thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      price: 349000,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      requirements: [
        "Basic React knowledge (components, hooks, state)",
        "Familiar with JavaScript/TypeScript",
        "Basic understanding of REST APIs",
      ],
      outcomes: [
        "Build production-grade Next.js applications",
        "Implement authentication with NextAuth.js",
        "Design and manage PostgreSQL databases with Prisma",
        "Integrate Stripe for subscription payments",
        "Deploy to Vercel with CI/CD",
      ],
      rating: 4.9,
      reviewCount: 312,
      enrollmentCount: 1840,
      publishedAgo: 90,
      createdAgo: 95,
      instructorId: rina.id,
      categorySlug: "web-development",
      trailerUrl: SAMPLE_VIDEO,
    },
    {
      title: "Figma to Code — Design Systems for Developers",
      slug: "figma-to-code-design-systems",
      description:
        "Translate Figma designs into pixel-perfect React components. Build a complete design system with Tailwind CSS and shadcn/ui while mastering component architecture and design tokens.",
      shortDesc: "Translate Figma designs into a production-ready component library.",
      thumbnailUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
      price: 299000,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      requirements: ["Basic HTML & CSS", "Familiar with React components"],
      outcomes: [
        "Read and interpret Figma design files",
        "Build a scalable component library",
        "Implement design tokens with Tailwind",
        "Create consistent UI with shadcn/ui",
      ],
      rating: 4.7,
      reviewCount: 187,
      enrollmentCount: 920,
      publishedAgo: 70,
      createdAgo: 80,
      instructorId: budi.id,
      categorySlug: "ui-ux-design",
    },
    {
      title: "REST API with Laravel 11 & PostgreSQL",
      slug: "rest-api-laravel-11-postgresql",
      description:
        "Build robust, scalable REST APIs using Laravel 11. Covers Sanctum auth, resource controllers, API versioning, request validation, rate limiting, and PHPUnit testing.",
      shortDesc: "Build scalable REST APIs with Laravel 11 and PostgreSQL.",
      thumbnailUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
      price: 0,
      level: "BEGINNER",
      status: "PUBLISHED",
      requirements: ["Basic PHP knowledge", "Understand what an API is"],
      outcomes: [
        "Build RESTful APIs with Laravel 11",
        "Implement token-based auth with Sanctum",
        "Write database migrations and seeders",
        "Test APIs with Postman and PHPUnit",
      ],
      rating: 4.8,
      reviewCount: 543,
      enrollmentCount: 3210,
      publishedAgo: 200,
      createdAgo: 210,
      instructorId: rina.id,
      categorySlug: "web-development",
    },
    {
      title: "Data Engineering with Python & dbt",
      slug: "data-engineering-python-dbt",
      description:
        "Modern data engineering with Python, Apache Airflow, dbt, and BigQuery. Build end-to-end batch and streaming pipelines from scratch.",
      shortDesc: "Build production data pipelines with Python, Airflow, and dbt.",
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      price: 449000,
      level: "ADVANCED",
      status: "PUBLISHED",
      requirements: [
        "Python fundamentals",
        "Basic SQL knowledge",
        "Comfortable with command line",
      ],
      outcomes: [
        "Build batch and streaming pipelines",
        "Orchestrate workflows with Airflow",
        "Transform data with dbt",
        "Load data into BigQuery and Snowflake",
      ],
      rating: 4.8,
      reviewCount: 98,
      enrollmentCount: 540,
      publishedAgo: 50,
      createdAgo: 60,
      instructorId: sari.id,
      categorySlug: "data-science",
    },
    {
      title: "Docker & Kubernetes for Web Developers",
      slug: "docker-kubernetes-web-developers",
      description:
        "Containerize your web applications and deploy them to Kubernetes. Covers Docker, Compose, Kubernetes core concepts, Helm charts, and managed clusters.",
      shortDesc: "Containerize and deploy web apps with Docker and Kubernetes.",
      thumbnailUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
      price: 399000,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      requirements: [
        "Basic Linux command line",
        "Have deployed at least one web app",
      ],
      outcomes: [
        "Write production Dockerfiles",
        "Orchestrate multi-container apps with Compose",
        "Understand Kubernetes core concepts",
        "Set up CI/CD with GitHub Actions",
      ],
      rating: 4.6,
      reviewCount: 134,
      enrollmentCount: 670,
      publishedAgo: 110,
      createdAgo: 120,
      instructorId: rizky.id,
      categorySlug: "devops",
    },
    {
      title: "TypeScript Mastery — From Zero to Production",
      slug: "typescript-mastery-zero-to-production",
      description:
        "Master TypeScript from the ground up. Type system fundamentals, generics, utility types, decorators, and real-world patterns used in Node.js and React codebases.",
      shortDesc: "Master TypeScript with real-world patterns for React and Node.js.",
      thumbnailUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
      price: 279000,
      level: "BEGINNER",
      status: "PUBLISHED",
      requirements: ["JavaScript fundamentals"],
      outcomes: [
        "Understand the TypeScript type system",
        "Write type-safe React components",
        "Use generics and utility types",
        "Apply TypeScript in real projects",
      ],
      rating: 4.9,
      reviewCount: 421,
      enrollmentCount: 2340,
      publishedAgo: 240,
      createdAgo: 250,
      instructorId: rina.id,
      categorySlug: "web-development",
    },
    {
      title: "React Native — Build Cross-Platform Mobile Apps",
      slug: "react-native-cross-platform",
      description:
        "Build iOS and Android apps with React Native and Expo. Navigation, state management, native APIs, push notifications, and store deployment.",
      shortDesc: "Build iOS & Android apps with React Native and Expo.",
      thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
      price: 349000,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      requirements: ["React fundamentals", "Basic JavaScript/TypeScript"],
      outcomes: [
        "Build cross-platform mobile apps",
        "Implement navigation with Expo Router",
        "Manage state with Zustand",
        "Publish to App Store and Google Play",
      ],
      rating: 4.7,
      reviewCount: 156,
      enrollmentCount: 780,
      publishedAgo: 65,
      createdAgo: 75,
      instructorId: dewi.id,
      categorySlug: "mobile-development",
    },
    {
      title: "UX Research — Methods & Practical Application",
      slug: "ux-research-methods-practical",
      description:
        "Conduct effective UX research. User interviews, usability testing, surveys, competitive analysis, affinity mapping, and stakeholder communication.",
      shortDesc: "Master UX research methods and translate findings into design decisions.",
      thumbnailUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80",
      price: 0,
      level: "BEGINNER",
      status: "PUBLISHED",
      requirements: ["No prior UX experience needed"],
      outcomes: [
        "Plan and conduct user interviews",
        "Run moderated usability tests",
        "Synthesize research with affinity mapping",
        "Create research reports for stakeholders",
      ],
      rating: 4.8,
      reviewCount: 289,
      enrollmentCount: 1920,
      publishedAgo: 170,
      createdAgo: 180,
      instructorId: budi.id,
      categorySlug: "ui-ux-design",
    },
    {
      title: "Practical AI Engineering with LLMs",
      slug: "practical-ai-engineering-llms",
      description:
        "Build LLM-powered apps in production. Prompt engineering, RAG, function calling, evals, embeddings, vector stores, and observability with OpenAI, Anthropic, and Vercel AI SDK.",
      shortDesc: "Ship reliable LLM apps with RAG, evals, and observability.",
      thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      price: 499000,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      requirements: ["Comfortable with TypeScript or Python", "Basic web/API skills"],
      outcomes: [
        "Build RAG pipelines end-to-end",
        "Design and run model evals",
        "Use function/tool calling reliably",
        "Add observability and tracing",
      ],
      rating: 4.9,
      reviewCount: 76,
      enrollmentCount: 410,
      publishedAgo: 28,
      createdAgo: 40,
      instructorId: sari.id,
      categorySlug: "ai-ml",
    },
    {
      title: "Web App Security Fundamentals",
      slug: "web-app-security-fundamentals",
      description:
        "Defensive security for web developers. OWASP Top 10, secure auth, session handling, CSRF/XSS, dependency hygiene, secrets management, and threat modeling.",
      shortDesc: "Defensive security skills every web developer needs.",
      thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
      price: 329000,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      requirements: ["1+ year web development experience"],
      outcomes: [
        "Identify OWASP Top 10 risks",
        "Implement secure auth & sessions",
        "Mitigate CSRF, XSS, and SSRF",
        "Run threat modeling sessions",
      ],
      rating: 4.6,
      reviewCount: 142,
      enrollmentCount: 690,
      publishedAgo: 85,
      createdAgo: 95,
      instructorId: rizky.id,
      categorySlug: "cybersecurity",
    },
    {
      title: "Product Discovery for Engineers",
      slug: "product-discovery-for-engineers",
      description:
        "Stop building the wrong things. Practical discovery techniques: opportunity solution trees, customer interviews, prototyping, and continuous discovery habits.",
      shortDesc: "Discovery techniques engineers can run without a PM.",
      thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      price: 199000,
      level: "BEGINNER",
      status: "PUBLISHED",
      requirements: ["Some experience shipping products"],
      outcomes: [
        "Run customer discovery interviews",
        "Build opportunity solution trees",
        "Prototype to test assumptions cheaply",
        "Make better build/no-build decisions",
      ],
      rating: 4.5,
      reviewCount: 64,
      enrollmentCount: 320,
      publishedAgo: 45,
      createdAgo: 55,
      instructorId: budi.id,
      categorySlug: "product-management",
    },
    {
      title: "Flutter for iOS, Android & Web (Coming Soon)",
      slug: "flutter-multiplatform",
      description:
        "Comprehensive Flutter course covering Material 3, Riverpod, Firebase, and adaptive UI for phones, tablets, and the web.",
      shortDesc: "One Flutter codebase for iOS, Android, and web.",
      thumbnailUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
      price: 379000,
      level: "INTERMEDIATE",
      status: "DRAFT",
      requirements: ["Basic Dart knowledge helpful but not required"],
      outcomes: [
        "Build adaptive Flutter UIs",
        "Manage state with Riverpod",
        "Integrate Firebase Auth and Firestore",
      ],
      enrollmentCount: 0,
      reviewCount: 0,
      publishedAgo: undefined,
      createdAgo: 10,
      instructorId: dewi.id,
      categorySlug: "mobile-development",
    },
    {
      title: "Advanced Postgres for Application Developers",
      slug: "advanced-postgres-app-developers",
      description:
        "Indexes, query plans, partitioning, replication, JSONB, full-text search, and operational best practices for PostgreSQL in production.",
      shortDesc: "Take your PostgreSQL skills from intermediate to expert.",
      thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
      price: 359000,
      level: "ADVANCED",
      status: "PENDING_REVIEW",
      requirements: ["Comfortable with SQL", "Operating a PostgreSQL DB in any environment"],
      outcomes: [
        "Read query plans confidently",
        "Design effective indexes",
        "Operate PostgreSQL safely in production",
      ],
      enrollmentCount: 0,
      reviewCount: 0,
      publishedAgo: undefined,
      createdAgo: 5,
      instructorId: sari.id,
      categorySlug: "data-science",
    },
    {
      title: "Vue 2 Migration Playbook (Legacy)",
      slug: "vue-2-migration-playbook-legacy",
      description:
        "Migration patterns from Vue 2 to Vue 3 / Nuxt 3 for legacy codebases. Archived as the ecosystem has fully moved on.",
      shortDesc: "Archived migration guide for Vue 2 → Vue 3 codebases.",
      thumbnailUrl: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&q=80",
      price: 0,
      level: "INTERMEDIATE",
      status: "ARCHIVED",
      requirements: ["Existing Vue 2 codebase"],
      outcomes: ["Plan a safe Vue 2 → Vue 3 migration"],
      enrollmentCount: 90,
      reviewCount: 8,
      rating: 4.2,
      publishedAgo: 540,
      createdAgo: 600,
      instructorId: rina.id,
      categorySlug: "web-development",
    },
  ]

  const courses: Awaited<ReturnType<typeof prisma.course.create>>[] = []
  for (const c of courseInputs) {
    const created = await prisma.course.create({
      data: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        shortDesc: c.shortDesc,
        thumbnailUrl: c.thumbnailUrl,
        trailerUrl: c.trailerUrl ?? null,
        price: c.price,
        isFree: c.price === 0,
        status: c.status,
        level: c.level,
        language: "id",
        requirements: c.requirements,
        outcomes: c.outcomes,
        rating: c.rating ?? 0,
        reviewCount: c.reviewCount ?? 0,
        enrollmentCount: c.enrollmentCount ?? 0,
        publishedAt:
          c.publishedAgo !== undefined ? daysAgo(c.publishedAgo) : null,
        createdAt: daysAgo(c.createdAgo),
        instructorId: c.instructorId,
        categoryId: catBy(c.categorySlug).id,
      },
    })
    courses.push(created)
  }
  const courseBy = (slug: string) => {
    const c = courses.find((x) => x.slug === slug)
    if (!c) throw new Error(`Missing course ${slug}`)
    return c
  }
  console.log(`  Courses created (${courses.length})`)

  // ============================================================
  // CURRICULUM — chapters + lessons for each PUBLISHED course
  // ============================================================

  const lessonRefs: Record<string, { id: string; title: string; type: string }[]> = {}

  // course 1 — Next.js 15 SaaS
  lessonRefs[courseBy("nextjs-15-fullstack-saas").id] = await createCurriculum(
    courseBy("nextjs-15-fullstack-saas").id,
    [
      {
        title: "Getting Started",
        description: "Project overview and environment setup",
        isFree: true,
        lessons: [
          { title: "What we're building", duration: 480, isFree: true, description: "Tour of the final SaaS app" },
          { title: "Project setup & folder structure", duration: 720, isFree: true },
          { title: "Configuring Tailwind & shadcn/ui", duration: 600, isFree: false },
        ],
      },
      {
        title: "App Router Deep Dive",
        description: "Server components, layouts, and routing patterns",
        lessons: [
          { title: "Server vs Client components", duration: 900 },
          {
            title: "Nested layouts & route groups",
            duration: 840,
            description: "How layouts compose in App Router.",
            content:
              "In this lesson:\n\n1. Layouts nest automatically\n2. Route groups with (parens)\n3. Shared vs per-route layouts\n4. layout.tsx vs template.tsx",
          },
          { title: "Loading UI & Suspense", duration: 660 },
          { title: "Error boundaries", duration: 540 },
          { title: "Quiz — App Router Concepts", type: "QUIZ" },
        ],
      },
      {
        title: "Authentication",
        description: "Auth flow, sessions, and protected routes",
        lessons: [
          { title: "Project auth strategy", duration: 780 },
          { title: "Sign-up & sign-in flows", duration: 900 },
          { title: "Session management with cookies", duration: 720 },
          { title: "Middleware & protected routes", duration: 840 },
        ],
      },
      {
        title: "Database with Prisma",
        description: "Schema design, migrations, and queries",
        lessons: [
          { title: "Prisma schema design", duration: 1080 },
          { title: "Migrations & seed data", duration: 720 },
          { title: "Prisma schema reference", type: "ATTACHMENT" },
        ],
      },
      {
        title: "Stripe Payments",
        description: "Subscription billing and webhook handling",
        lessons: [
          { title: "Stripe Checkout integration", duration: 960 },
          { title: "Webhook handling", duration: 900 },
          { title: "Subscription management", duration: 840 },
        ],
      },
    ]
  )

  // course 2 — Figma to Code
  lessonRefs[courseBy("figma-to-code-design-systems").id] = await createCurriculum(
    courseBy("figma-to-code-design-systems").id,
    [
      {
        title: "Reading Figma Files",
        isFree: true,
        lessons: [
          { title: "Frames, components, and variants", duration: 540, isFree: true },
          { title: "Design tokens in Figma", duration: 660 },
        ],
      },
      {
        title: "Tailwind Foundations",
        lessons: [
          { title: "Token-driven Tailwind config", duration: 720 },
          { title: "Theming with CSS variables", duration: 600 },
          { title: "Dark mode the right way", duration: 540 },
        ],
      },
      {
        title: "Building the Component Library",
        lessons: [
          { title: "Button: variants & sizes", duration: 780 },
          { title: "Form primitives", duration: 900 },
          { title: "Modals & overlays", duration: 720 },
          { title: "Documenting with Storybook", duration: 840 },
        ],
      },
    ]
  )

  // course 3 — Laravel REST API
  lessonRefs[courseBy("rest-api-laravel-11-postgresql").id] = await createCurriculum(
    courseBy("rest-api-laravel-11-postgresql").id,
    [
      {
        title: "Laravel Setup",
        isFree: true,
        lessons: [
          { title: "Installing Laravel 11", duration: 420, isFree: true },
          { title: "Routing basics", duration: 480, isFree: true },
        ],
      },
      {
        title: "Resource Controllers",
        lessons: [
          { title: "RESTful resource routes", duration: 600 },
          { title: "Form Requests & validation", duration: 720 },
          { title: "API Resources & transformers", duration: 660 },
        ],
      },
      {
        title: "Authentication with Sanctum",
        lessons: [
          { title: "Token issuance", duration: 540 },
          { title: "Protecting routes with middleware", duration: 480 },
          { title: "Refresh & revoke patterns", duration: 540 },
        ],
      },
      {
        title: "Testing & Deployment",
        lessons: [
          { title: "PHPUnit feature tests", duration: 720 },
          { title: "Postman collections", type: "ATTACHMENT" },
          { title: "Deploying to a VPS", duration: 840 },
        ],
      },
    ]
  )

  // course 4 — Data Engineering
  lessonRefs[courseBy("data-engineering-python-dbt").id] = await createCurriculum(
    courseBy("data-engineering-python-dbt").id,
    [
      {
        title: "Pipeline Foundations",
        isFree: true,
        lessons: [
          { title: "Modern data stack overview", duration: 600, isFree: true },
          { title: "Sources, sinks, and contracts", duration: 540 },
        ],
      },
      {
        title: "Apache Airflow",
        lessons: [
          { title: "DAGs and operators", duration: 780 },
          { title: "Scheduling & backfills", duration: 660 },
          { title: "Sensors and triggers", duration: 540 },
        ],
      },
      {
        title: "dbt Transformations",
        lessons: [
          { title: "Models, sources, and seeds", duration: 720 },
          { title: "Tests & docs", duration: 600 },
          { title: "Snapshots & SCD Type 2", duration: 660 },
        ],
      },
      {
        title: "BigQuery Loading",
        lessons: [
          { title: "Partitioning & clustering", duration: 540 },
          { title: "Cost-aware queries", duration: 480 },
        ],
      },
    ]
  )

  // course 5 — Docker & Kubernetes
  lessonRefs[courseBy("docker-kubernetes-web-developers").id] = await createCurriculum(
    courseBy("docker-kubernetes-web-developers").id,
    [
      {
        title: "Docker Foundations",
        isFree: true,
        lessons: [
          { title: "Images, layers, and the daemon", duration: 540, isFree: true },
          { title: "Writing production Dockerfiles", duration: 720 },
        ],
      },
      {
        title: "Compose for Local Dev",
        lessons: [
          { title: "Multi-container apps", duration: 660 },
          { title: "Volumes and networking", duration: 540 },
        ],
      },
      {
        title: "Kubernetes Core",
        lessons: [
          { title: "Pods, Deployments, Services", duration: 780 },
          { title: "ConfigMaps & Secrets", duration: 600 },
          { title: "Ingress & TLS", duration: 660 },
          { title: "Quiz — K8s Concepts", type: "QUIZ" },
        ],
      },
      {
        title: "GitOps & CI/CD",
        lessons: [
          { title: "GitHub Actions for K8s", duration: 720 },
          { title: "Helm charts intro", duration: 540 },
        ],
      },
    ]
  )

  // course 6 — TypeScript Mastery
  lessonRefs[courseBy("typescript-mastery-zero-to-production").id] = await createCurriculum(
    courseBy("typescript-mastery-zero-to-production").id,
    [
      {
        title: "Type System Basics",
        isFree: true,
        lessons: [
          { title: "Why TypeScript?", duration: 360, isFree: true },
          { title: "Primitives & inference", duration: 480, isFree: true },
          { title: "Functions & overloads", duration: 600 },
        ],
      },
      {
        title: "Advanced Types",
        lessons: [
          { title: "Generics", duration: 720 },
          { title: "Conditional & mapped types", duration: 780 },
          { title: "Utility types catalogue", duration: 540 },
        ],
      },
      {
        title: "TypeScript in React",
        lessons: [
          { title: "Typing components & props", duration: 660 },
          { title: "Discriminated unions in UI", duration: 600 },
          { title: "Quiz — Type System", type: "QUIZ" },
        ],
      },
    ]
  )

  // course 7 — React Native
  lessonRefs[courseBy("react-native-cross-platform").id] = await createCurriculum(
    courseBy("react-native-cross-platform").id,
    [
      {
        title: "Expo Project Setup",
        isFree: true,
        lessons: [
          { title: "Why Expo", duration: 420, isFree: true },
          { title: "Routing with Expo Router", duration: 660 },
        ],
      },
      {
        title: "Building Screens",
        lessons: [
          { title: "Layout primitives", duration: 600 },
          { title: "Lists & performance", duration: 720 },
          { title: "Native gestures", duration: 540 },
        ],
      },
      {
        title: "Native Capabilities",
        lessons: [
          { title: "Camera & media library", duration: 660 },
          { title: "Push notifications", duration: 720 },
          { title: "Deep linking", duration: 540 },
        ],
      },
      {
        title: "Shipping to Stores",
        lessons: [
          { title: "EAS Build basics", duration: 480 },
          { title: "App Store / Play submission", duration: 600 },
        ],
      },
    ]
  )

  // course 8 — UX Research
  lessonRefs[courseBy("ux-research-methods-practical").id] = await createCurriculum(
    courseBy("ux-research-methods-practical").id,
    [
      {
        title: "Research Foundations",
        isFree: true,
        lessons: [
          { title: "Generative vs evaluative", duration: 420, isFree: true },
          { title: "Choosing methods", duration: 540, isFree: true },
        ],
      },
      {
        title: "Interviews",
        lessons: [
          { title: "Recruiting participants", duration: 540 },
          { title: "Interview script design", duration: 600 },
          { title: "Note-taking systems", duration: 480 },
        ],
      },
      {
        title: "Synthesis",
        lessons: [
          { title: "Affinity mapping", duration: 720 },
          { title: "Insights vs observations", duration: 540 },
          { title: "Sharing findings", duration: 480 },
        ],
      },
    ]
  )

  // course 9 — Practical AI Engineering
  lessonRefs[courseBy("practical-ai-engineering-llms").id] = await createCurriculum(
    courseBy("practical-ai-engineering-llms").id,
    [
      {
        title: "LLM Fundamentals",
        isFree: true,
        lessons: [
          { title: "How LLMs actually work", duration: 540, isFree: true },
          { title: "Tokens, context, and cost", duration: 480, isFree: true },
        ],
      },
      {
        title: "Prompting & Tool Use",
        lessons: [
          { title: "Prompt patterns that survive prod", duration: 660 },
          { title: "Function / tool calling", duration: 720 },
        ],
      },
      {
        title: "RAG Pipelines",
        lessons: [
          { title: "Chunking strategies", duration: 600 },
          { title: "Embeddings & vector stores", duration: 720 },
          { title: "Retrieval evals", duration: 660 },
        ],
      },
      {
        title: "Production Concerns",
        lessons: [
          { title: "Tracing and observability", duration: 540 },
          { title: "Safety, PII, and red-teaming", duration: 600 },
        ],
      },
    ]
  )

  // course 10 — Web Security
  lessonRefs[courseBy("web-app-security-fundamentals").id] = await createCurriculum(
    courseBy("web-app-security-fundamentals").id,
    [
      {
        title: "OWASP Top 10",
        isFree: true,
        lessons: [
          { title: "Tour of the OWASP Top 10", duration: 600, isFree: true },
          { title: "Threat modeling 101", duration: 540 },
        ],
      },
      {
        title: "Auth & Sessions",
        lessons: [
          { title: "Password storage done right", duration: 480 },
          { title: "Session lifecycle", duration: 540 },
          { title: "MFA patterns", duration: 480 },
        ],
      },
      {
        title: "Common Web Attacks",
        lessons: [
          { title: "XSS deep dive", duration: 660 },
          { title: "CSRF and SameSite", duration: 540 },
          { title: "SSRF in modern apps", duration: 600 },
        ],
      },
    ]
  )

  // course 11 — Product Discovery
  lessonRefs[courseBy("product-discovery-for-engineers").id] = await createCurriculum(
    courseBy("product-discovery-for-engineers").id,
    [
      {
        title: "Discovery Mindset",
        isFree: true,
        lessons: [
          { title: "Why discovery matters", duration: 360, isFree: true },
          { title: "Continuous discovery loop", duration: 480, isFree: true },
        ],
      },
      {
        title: "Customer Interviews",
        lessons: [
          { title: "Recruitment without a research team", duration: 540 },
          { title: "Asking better questions", duration: 600 },
        ],
      },
      {
        title: "Opportunity Solution Trees",
        lessons: [
          { title: "From opportunities to bets", duration: 720 },
          { title: "Prototyping cheaply", duration: 540 },
        ],
      },
    ]
  )

  // course 14 archived — Vue 2 migration (sparse curriculum)
  lessonRefs[courseBy("vue-2-migration-playbook-legacy").id] = await createCurriculum(
    courseBy("vue-2-migration-playbook-legacy").id,
    [
      {
        title: "Migration Strategy",
        isFree: true,
        lessons: [
          { title: "Inventory and risk mapping", duration: 480, isFree: true },
          { title: "Incremental adoption", duration: 540 },
        ],
      },
    ]
  )

  console.log("  Curriculum created")

  // ============================================================
  // QUIZZES — wire to QUIZ-typed lessons
  // ============================================================

  const nextLessons = lessonRefs[courseBy("nextjs-15-fullstack-saas").id]
  const k8sLessons = lessonRefs[courseBy("docker-kubernetes-web-developers").id]
  const tsLessons = lessonRefs[courseBy("typescript-mastery-zero-to-production").id]

  const quizLessonNext = nextLessons.find((l) => l.type === "QUIZ")
  const quizLessonK8s = k8sLessons.find((l) => l.type === "QUIZ")
  const quizLessonTS = tsLessons.find((l) => l.type === "QUIZ")
  if (!quizLessonNext || !quizLessonK8s || !quizLessonTS) {
    throw new Error("Expected QUIZ lessons missing")
  }

  const quizNext = await prisma.quiz.create({
    data: {
      title: "App Router Concepts",
      passingScore: 75,
      allowRetake: true,
      maxAttempts: 3,
      timeLimit: 600,
      lessonId: quizLessonNext.id,
      questions: {
        create: [
          {
            text: "Apa perbedaan utama antara Server Component dan Client Component di Next.js?",
            explanation:
              "Server Components dirender di server dan tidak mengirim JS ke browser. Client Components dirender di browser dan butuh 'use client'.",
            position: 1,
            points: 25,
            options: {
              create: [
                { text: "Server Component dirender di server, Client Component di browser", isCorrect: true, position: 1 },
                { text: "Server Component lebih cepat karena cache", isCorrect: false, position: 2 },
                { text: "Client Component tidak bisa akses database", isCorrect: false, position: 3 },
                { text: "Tidak ada perbedaan, hanya penamaan berbeda", isCorrect: false, position: 4 },
              ],
            },
          },
          {
            text: "Bagaimana cara membuat route group di App Router?",
            explanation: "Route group: bungkus folder dengan tanda kurung, mis. (marketing). Tidak mempengaruhi URL.",
            position: 2,
            points: 25,
            options: {
              create: [
                { text: "Underscore: _marketing/page.tsx", isCorrect: false, position: 1 },
                { text: "Tanda kurung: (marketing)/page.tsx", isCorrect: true, position: 2 },
                { text: "Bracket: [marketing]/page.tsx", isCorrect: false, position: 3 },
                { text: "Config di next.config.ts", isCorrect: false, position: 4 },
              ],
            },
          },
          {
            text: "Apa fungsi loading.tsx?",
            explanation: "Menampilkan UI loading otomatis via Suspense saat halaman dimuat.",
            position: 3,
            points: 25,
            options: {
              create: [
                { text: "Animasi loading saat app pertama dibuka", isCorrect: false, position: 1 },
                { text: "Skeleton UI otomatis via Suspense", isCorrect: true, position: 2 },
                { text: "Mengatur timeout API request", isCorrect: false, position: 3 },
                { text: "Progress bar di atas halaman", isCorrect: false, position: 4 },
              ],
            },
          },
          {
            text: "Kapan menggunakan 'use client'?",
            explanation: "Hanya saat component butuh interaktivitas browser (hooks, event handlers, browser APIs).",
            position: 4,
            points: 25,
            options: {
              create: [
                { text: "Di setiap component agar bisa pakai hooks", isCorrect: false, position: 1 },
                { text: "Hanya di layout.tsx", isCorrect: false, position: 2 },
                { text: "Saat butuh state, effects, atau event handlers", isCorrect: true, position: 3 },
                { text: "Saat component ambil data dari database", isCorrect: false, position: 4 },
              ],
            },
          },
        ],
      },
    },
  })

  await prisma.quiz.create({
    data: {
      title: "Kubernetes Concepts",
      passingScore: 70,
      allowRetake: true,
      maxAttempts: 3,
      timeLimit: 480,
      lessonId: quizLessonK8s.id,
      questions: {
        create: [
          {
            text: "Apa unit terkecil yang dapat di-deploy di Kubernetes?",
            position: 1,
            points: 33,
            options: {
              create: [
                { text: "Pod", isCorrect: true, position: 1 },
                { text: "Container", isCorrect: false, position: 2 },
                { text: "Node", isCorrect: false, position: 3 },
                { text: "Deployment", isCorrect: false, position: 4 },
              ],
            },
          },
          {
            text: "Resource mana yang menyediakan stable network identity untuk satu set Pod?",
            position: 2,
            points: 33,
            options: {
              create: [
                { text: "Service", isCorrect: true, position: 1 },
                { text: "Ingress", isCorrect: false, position: 2 },
                { text: "ConfigMap", isCorrect: false, position: 3 },
                { text: "DaemonSet", isCorrect: false, position: 4 },
              ],
            },
          },
          {
            text: "Bagaimana cara menyimpan kredensial sensitif di Kubernetes?",
            position: 3,
            points: 34,
            options: {
              create: [
                { text: "Hardcode di Deployment", isCorrect: false, position: 1 },
                { text: "ConfigMap", isCorrect: false, position: 2 },
                { text: "Secret (idealnya dengan KMS provider)", isCorrect: true, position: 3 },
                { text: "Annotation", isCorrect: false, position: 4 },
              ],
            },
          },
        ],
      },
    },
  })

  await prisma.quiz.create({
    data: {
      title: "TypeScript Type System",
      passingScore: 70,
      allowRetake: true,
      maxAttempts: 5,
      timeLimit: 420,
      lessonId: quizLessonTS.id,
      questions: {
        create: [
          {
            text: "Apa hasil tipe dari `type X = keyof { a: 1; b: 2 }`?",
            position: 1,
            points: 50,
            options: {
              create: [
                { text: "string", isCorrect: false, position: 1 },
                { text: "'a' | 'b'", isCorrect: true, position: 2 },
                { text: "1 | 2", isCorrect: false, position: 3 },
                { text: "never", isCorrect: false, position: 4 },
              ],
            },
          },
          {
            text: "Utility type untuk membuat semua property optional?",
            position: 2,
            points: 50,
            options: {
              create: [
                { text: "Required<T>", isCorrect: false, position: 1 },
                { text: "Readonly<T>", isCorrect: false, position: 2 },
                { text: "Partial<T>", isCorrect: true, position: 3 },
                { text: "Pick<T, K>", isCorrect: false, position: 4 },
              ],
            },
          },
        ],
      },
    },
  })

  console.log("  Quizzes created")

  // ============================================================
  // ATTACHMENTS
  // ============================================================

  await prisma.attachment.createMany({
    data: [
      {
        name: "Prisma Schema Starter.prisma",
        url: "#",
        size: 4200,
        mimeType: "text/plain",
        courseId: courseBy("nextjs-15-fullstack-saas").id,
      },
      {
        name: "SaaS Boilerplate.zip",
        url: "#",
        size: 2_048_000,
        mimeType: "application/zip",
        courseId: courseBy("nextjs-15-fullstack-saas").id,
      },
      {
        name: "Deployment Checklist.pdf",
        url: "#",
        size: 180_000,
        mimeType: "application/pdf",
        courseId: courseBy("nextjs-15-fullstack-saas").id,
      },
      {
        name: "Postman Collection.json",
        url: "#",
        size: 32_000,
        mimeType: "application/json",
        courseId: courseBy("rest-api-laravel-11-postgresql").id,
      },
      {
        name: "Design Tokens.json",
        url: "#",
        size: 12_400,
        mimeType: "application/json",
        courseId: courseBy("figma-to-code-design-systems").id,
      },
      {
        name: "K8s Cheatsheet.pdf",
        url: "#",
        size: 250_000,
        mimeType: "application/pdf",
        courseId: courseBy("docker-kubernetes-web-developers").id,
      },
      {
        name: "RAG Eval Worksheet.xlsx",
        url: "#",
        size: 86_000,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        courseId: courseBy("practical-ai-engineering-llms").id,
      },
    ],
  })

  console.log("  Attachments created")

  // ============================================================
  // ENROLLMENTS — distribute students across courses
  // ============================================================

  type EnrollmentSpec = {
    user: typeof alan
    courseSlug: string
    progressPercent: number
    enrolledDaysAgo: number
    completedDaysAgo?: number
  }

  const enrollmentSpecs: EnrollmentSpec[] = [
    // alan — primary student
    { user: alan, courseSlug: "nextjs-15-fullstack-saas", progressPercent: 62, enrolledDaysAgo: 80 },
    { user: alan, courseSlug: "rest-api-laravel-11-postgresql", progressPercent: 100, enrolledDaysAgo: 95, completedDaysAgo: 50 },
    { user: alan, courseSlug: "typescript-mastery-zero-to-production", progressPercent: 28, enrolledDaysAgo: 55 },
    { user: alan, courseSlug: "ux-research-methods-practical", progressPercent: 100, enrolledDaysAgo: 120, completedDaysAgo: 60 },
    { user: alan, courseSlug: "practical-ai-engineering-llms", progressPercent: 15, enrolledDaysAgo: 20 },
    // aditya
    { user: aditya, courseSlug: "nextjs-15-fullstack-saas", progressPercent: 100, enrolledDaysAgo: 70, completedDaysAgo: 25 },
    { user: aditya, courseSlug: "typescript-mastery-zero-to-production", progressPercent: 80, enrolledDaysAgo: 60 },
    { user: aditya, courseSlug: "docker-kubernetes-web-developers", progressPercent: 45, enrolledDaysAgo: 40 },
    // maya
    { user: maya, courseSlug: "nextjs-15-fullstack-saas", progressPercent: 100, enrolledDaysAgo: 75, completedDaysAgo: 30 },
    { user: maya, courseSlug: "figma-to-code-design-systems", progressPercent: 55, enrolledDaysAgo: 50 },
    { user: maya, courseSlug: "ux-research-methods-practical", progressPercent: 35, enrolledDaysAgo: 30 },
    // fajar
    { user: fajar, courseSlug: "rest-api-laravel-11-postgresql", progressPercent: 60, enrolledDaysAgo: 65 },
    { user: fajar, courseSlug: "web-app-security-fundamentals", progressPercent: 22, enrolledDaysAgo: 20 },
    // intan
    { user: intan, courseSlug: "react-native-cross-platform", progressPercent: 100, enrolledDaysAgo: 60, completedDaysAgo: 18 },
    { user: intan, courseSlug: "typescript-mastery-zero-to-production", progressPercent: 90, enrolledDaysAgo: 45 },
    { user: intan, courseSlug: "practical-ai-engineering-llms", progressPercent: 30, enrolledDaysAgo: 12 },
    // bagus
    { user: bagus, courseSlug: "data-engineering-python-dbt", progressPercent: 25, enrolledDaysAgo: 35 },
    { user: bagus, courseSlug: "docker-kubernetes-web-developers", progressPercent: 70, enrolledDaysAgo: 80 },
    // citra
    { user: citra, courseSlug: "ux-research-methods-practical", progressPercent: 100, enrolledDaysAgo: 100, completedDaysAgo: 40 },
    { user: citra, courseSlug: "figma-to-code-design-systems", progressPercent: 85, enrolledDaysAgo: 55 },
    { user: citra, courseSlug: "product-discovery-for-engineers", progressPercent: 50, enrolledDaysAgo: 22 },
    // dimas
    { user: dimas, courseSlug: "nextjs-15-fullstack-saas", progressPercent: 12, enrolledDaysAgo: 14 },
    { user: dimas, courseSlug: "rest-api-laravel-11-postgresql", progressPercent: 95, enrolledDaysAgo: 90 },
    // eka
    { user: eka, courseSlug: "rest-api-laravel-11-postgresql", progressPercent: 5, enrolledDaysAgo: 8 },
    // gita
    { user: gita, courseSlug: "react-native-cross-platform", progressPercent: 40, enrolledDaysAgo: 30 },
    { user: gita, courseSlug: "typescript-mastery-zero-to-production", progressPercent: 100, enrolledDaysAgo: 110, completedDaysAgo: 35 },
    // hadi
    { user: hadi, courseSlug: "web-app-security-fundamentals", progressPercent: 65, enrolledDaysAgo: 50 },
    { user: hadi, courseSlug: "docker-kubernetes-web-developers", progressPercent: 100, enrolledDaysAgo: 90, completedDaysAgo: 22 },
    // joko
    { user: joko, courseSlug: "ux-research-methods-practical", progressPercent: 0, enrolledDaysAgo: 6 },
  ]

  for (const e of enrollmentSpecs) {
    await prisma.enrollment.create({
      data: {
        userId: e.user.id,
        courseId: courseBy(e.courseSlug).id,
        progressPercent: e.progressPercent,
        enrolledAt: daysAgo(e.enrolledDaysAgo),
        completedAt: e.completedDaysAgo !== undefined ? daysAgo(e.completedDaysAgo) : null,
      },
    })
  }

  console.log(`  Enrollments created (${enrollmentSpecs.length})`)

  // ============================================================
  // LESSON PROGRESS — derive from enrollment progressPercent
  // ============================================================

  for (const e of enrollmentSpecs) {
    const lessons = lessonRefs[courseBy(e.courseSlug).id] ?? []
    if (lessons.length === 0) continue
    const completeUntil = Math.floor((lessons.length * e.progressPercent) / 100)
    for (let i = 0; i < lessons.length; i++) {
      const completed = i < completeUntil
      await prisma.lessonProgress.create({
        data: {
          userId: e.user.id,
          lessonId: lessons[i].id,
          isCompleted: completed,
          completedAt: completed ? daysAgo(Math.max(1, e.enrolledDaysAgo - i)) : null,
          watchedSeconds: completed ? 600 : i === completeUntil ? 240 : 0,
        },
      })
    }
  }

  console.log("  Lesson progress created")

  // ============================================================
  // QUIZ ATTEMPTS
  // ============================================================

  const quizQuestions = await prisma.question.findMany({
    where: { quizId: quizNext.id },
    include: { options: true },
    orderBy: { position: "asc" },
  })

  const correctAnswers: Record<string, string> = {}
  for (const q of quizQuestions) {
    const correct = q.options.find((o) => o.isCorrect)
    if (correct) correctAnswers[q.id] = correct.id
  }

  // alan passed on second try
  await prisma.quizAttempt.create({
    data: {
      userId: alan.id,
      quizId: quizNext.id,
      score: 50,
      isPassed: false,
      answers: Object.fromEntries(
        quizQuestions.map((q, i) => [q.id, q.options[i % q.options.length].id])
      ),
      startedAt: daysAgo(45),
      completedAt: daysAgo(45),
    },
  })

  await prisma.quizAttempt.create({
    data: {
      userId: alan.id,
      quizId: quizNext.id,
      score: 100,
      isPassed: true,
      answers: correctAnswers,
      startedAt: daysAgo(40),
      completedAt: daysAgo(40),
    },
  })

  // aditya passed first try
  await prisma.quizAttempt.create({
    data: {
      userId: aditya.id,
      quizId: quizNext.id,
      score: 100,
      isPassed: true,
      answers: correctAnswers,
      startedAt: daysAgo(28),
      completedAt: daysAgo(28),
    },
  })

  // maya passed
  await prisma.quizAttempt.create({
    data: {
      userId: maya.id,
      quizId: quizNext.id,
      score: 75,
      isPassed: true,
      answers: { ...correctAnswers, [quizQuestions[2].id]: quizQuestions[2].options[0].id },
      startedAt: daysAgo(35),
      completedAt: daysAgo(35),
    },
  })

  console.log("  Quiz attempts created")

  // ============================================================
  // REVIEWS
  // ============================================================

  type ReviewSpec = {
    user: typeof alan
    courseSlug: string
    rating: number
    comment: string
    daysAgo: number
  }

  const reviewSpecs: ReviewSpec[] = [
    {
      user: aditya,
      courseSlug: "nextjs-15-fullstack-saas",
      rating: 5,
      comment: "Materi paling lengkap untuk Next.js. Penjelasannya terstruktur dan langsung bisa dipraktekan.",
      daysAgo: 22,
    },
    {
      user: maya,
      courseSlug: "nextjs-15-fullstack-saas",
      rating: 5,
      comment: "Rina menjelaskan konsep kompleks dengan sangat simpel. Aku berhasil build SaaS pertama setelah selesai kursus ini.",
      daysAgo: 28,
    },
    {
      user: fajar,
      courseSlug: "rest-api-laravel-11-postgresql",
      rating: 4,
      comment: "Bagus sekali untuk pemula API. Sedikit bagian sudah kurang update tapi overall kursus terbaik.",
      daysAgo: 60,
    },
    {
      user: alan,
      courseSlug: "rest-api-laravel-11-postgresql",
      rating: 5,
      comment: "Selesai dalam 2 minggu. Praktik langsung deploy ke VPS sangat membantu.",
      daysAgo: 45,
    },
    {
      user: alan,
      courseSlug: "ux-research-methods-practical",
      rating: 5,
      comment: "Sebagai engineer, ini benar-benar membuka mata. Kerangkanya bisa langsung dipakai sprint depan.",
      daysAgo: 55,
    },
    {
      user: citra,
      courseSlug: "ux-research-methods-practical",
      rating: 5,
      comment: "Templates dan checklist-nya luar biasa. Worth jauh lebih dari harganya.",
      daysAgo: 38,
    },
    {
      user: citra,
      courseSlug: "figma-to-code-design-systems",
      rating: 4,
      comment: "Bagian Storybook agak singkat, tapi bagian Tailwind tokens-nya emas.",
      daysAgo: 25,
    },
    {
      user: maya,
      courseSlug: "figma-to-code-design-systems",
      rating: 5,
      comment: "Akhirnya paham kenapa design system di kantor selalu drift. Pendekatannya solid.",
      daysAgo: 30,
    },
    {
      user: intan,
      courseSlug: "react-native-cross-platform",
      rating: 5,
      comment: "Dewi membahas pitfalls iOS vs Android dengan sangat realistis. Project-nya juga jalan di store.",
      daysAgo: 15,
    },
    {
      user: gita,
      courseSlug: "typescript-mastery-zero-to-production",
      rating: 5,
      comment: "Sekarang gak takut lagi ngeliat tipe generic yang panjang. Penjelasan Rina top.",
      daysAgo: 32,
    },
    {
      user: hadi,
      courseSlug: "docker-kubernetes-web-developers",
      rating: 4,
      comment: "Konsep K8s jadi clear. Bagian Helm minta dikupas lebih dalam di update berikutnya.",
      daysAgo: 20,
    },
    {
      user: aditya,
      courseSlug: "docker-kubernetes-web-developers",
      rating: 5,
      comment: "GitHub Actions integration langsung kepake di tim. Mantap.",
      daysAgo: 18,
    },
    {
      user: bagus,
      courseSlug: "data-engineering-python-dbt",
      rating: 4,
      comment: "Sangat applied. Curiganya akan banyak update karena ekosistem cepat berubah.",
      daysAgo: 12,
    },
    {
      user: hadi,
      courseSlug: "web-app-security-fundamentals",
      rating: 5,
      comment: "Cocok untuk fullstack yang mau melengkapi kelemahan security. Praktik labnya seru.",
      daysAgo: 14,
    },
    {
      user: alan,
      courseSlug: "practical-ai-engineering-llms",
      rating: 5,
      comment: "Bagian eval-nya jarang dibahas course lain. Pendekatannya sangat pragmatic.",
      daysAgo: 8,
    },
    {
      user: intan,
      courseSlug: "practical-ai-engineering-llms",
      rating: 4,
      comment: "Konten padat. Ekspektasinya udah harus paham TS dasar.",
      daysAgo: 6,
    },
  ]

  for (const r of reviewSpecs) {
    await prisma.review.create({
      data: {
        userId: r.user.id,
        courseId: courseBy(r.courseSlug).id,
        rating: r.rating,
        comment: r.comment,
        createdAt: daysAgo(r.daysAgo),
      },
    })
  }

  console.log(`  Reviews created (${reviewSpecs.length})`)

  // ============================================================
  // CERTIFICATES — for completed enrollments
  // ============================================================

  const completed = enrollmentSpecs.filter((e) => e.progressPercent === 100)
  for (const e of completed) {
    await prisma.certificate.create({
      data: {
        userId: e.user.id,
        courseId: courseBy(e.courseSlug).id,
        issuedAt: e.completedDaysAgo !== undefined ? daysAgo(e.completedDaysAgo) : daysAgo(1),
      },
    })
  }
  console.log(`  Certificates issued (${completed.length})`)

  // ============================================================
  // COUPONS
  // ============================================================

  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: "LEARNIFY20",
        discountPercent: 20,
        maxUses: 200,
        usedCount: 47,
        expiresAt: daysAgo(-60), // 60 days from now
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: "EARLYBIRD30",
        discountPercent: 30,
        maxUses: 100,
        usedCount: 100,
        expiresAt: daysAgo(20),
        isActive: false,
      },
    }),
    prisma.coupon.create({
      data: {
        code: "RAMADAN50",
        discountPercent: 50,
        maxUses: 50,
        usedCount: 12,
        expiresAt: daysAgo(-14),
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: "SUMMER10",
        discountPercent: 10,
        maxUses: null,
        usedCount: 8,
        expiresAt: null,
        isActive: true,
      },
    }),
  ])

  console.log(`  Coupons created (${coupons.length})`)

  // ============================================================
  // ORDERS — multiple statuses across users
  // ============================================================

  type OrderSpec = {
    user: typeof alan
    courseSlug: string
    amount: number
    status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
    paymentMethod?: string
    paymentId?: string
    paidDaysAgo?: number
    refundedDaysAgo?: number
    createdDaysAgo: number
    couponCode?: string
    failReason?: string
  }

  const orderSpecs: OrderSpec[] = [
    {
      user: alan,
      courseSlug: "nextjs-15-fullstack-saas",
      amount: 349000,
      status: "COMPLETED",
      paymentMethod: "BANK_TRANSFER",
      paymentId: "seed_bca_001",
      paidDaysAgo: 80,
      createdDaysAgo: 80,
    },
    {
      user: alan,
      courseSlug: "typescript-mastery-zero-to-production",
      amount: 279000,
      status: "COMPLETED",
      paymentMethod: "GOPAY",
      paymentId: "seed_gopay_002",
      paidDaysAgo: 55,
      createdDaysAgo: 55,
    },
    {
      user: alan,
      courseSlug: "practical-ai-engineering-llms",
      amount: 399200,
      status: "COMPLETED",
      paymentMethod: "QRIS",
      paymentId: "seed_qris_003",
      paidDaysAgo: 20,
      createdDaysAgo: 20,
      couponCode: "LEARNIFY20",
    },
    {
      user: aditya,
      courseSlug: "nextjs-15-fullstack-saas",
      amount: 349000,
      status: "COMPLETED",
      paymentMethod: "QRIS",
      paymentId: "seed_qris_004",
      paidDaysAgo: 70,
      createdDaysAgo: 70,
    },
    {
      user: aditya,
      courseSlug: "typescript-mastery-zero-to-production",
      amount: 279000,
      status: "COMPLETED",
      paymentMethod: "BANK_TRANSFER",
      paymentId: "seed_bca_005",
      paidDaysAgo: 60,
      createdDaysAgo: 60,
    },
    {
      user: aditya,
      courseSlug: "docker-kubernetes-web-developers",
      amount: 399000,
      status: "COMPLETED",
      paymentMethod: "OVO",
      paymentId: "seed_ovo_006",
      paidDaysAgo: 40,
      createdDaysAgo: 40,
    },
    {
      user: maya,
      courseSlug: "nextjs-15-fullstack-saas",
      amount: 349000,
      status: "COMPLETED",
      paymentMethod: "GOPAY",
      paymentId: "seed_gopay_007",
      paidDaysAgo: 75,
      createdDaysAgo: 75,
    },
    {
      user: maya,
      courseSlug: "figma-to-code-design-systems",
      amount: 299000,
      status: "COMPLETED",
      paymentMethod: "DANA",
      paymentId: "seed_dana_008",
      paidDaysAgo: 50,
      createdDaysAgo: 50,
    },
    {
      user: maya,
      courseSlug: "data-engineering-python-dbt",
      amount: 449000,
      status: "FAILED",
      paymentMethod: "CREDIT_CARD",
      createdDaysAgo: 18,
      failReason: "Insufficient funds",
    },
    {
      user: fajar,
      courseSlug: "web-app-security-fundamentals",
      amount: 329000,
      status: "COMPLETED",
      paymentMethod: "BANK_TRANSFER",
      paymentId: "seed_mandiri_009",
      paidDaysAgo: 20,
      createdDaysAgo: 20,
    },
    {
      user: fajar,
      courseSlug: "figma-to-code-design-systems",
      amount: 299000,
      status: "PENDING",
      paymentMethod: "OVO",
      createdDaysAgo: 2,
    },
    {
      user: intan,
      courseSlug: "react-native-cross-platform",
      amount: 244300,
      status: "COMPLETED",
      paymentMethod: "QRIS",
      paymentId: "seed_qris_010",
      paidDaysAgo: 60,
      createdDaysAgo: 60,
      couponCode: "EARLYBIRD30",
    },
    {
      user: intan,
      courseSlug: "typescript-mastery-zero-to-production",
      amount: 279000,
      status: "COMPLETED",
      paymentMethod: "GOPAY",
      paymentId: "seed_gopay_011",
      paidDaysAgo: 45,
      createdDaysAgo: 45,
    },
    {
      user: intan,
      courseSlug: "practical-ai-engineering-llms",
      amount: 499000,
      status: "COMPLETED",
      paymentMethod: "BANK_TRANSFER",
      paymentId: "seed_bca_012",
      paidDaysAgo: 12,
      createdDaysAgo: 12,
    },
    {
      user: bagus,
      courseSlug: "data-engineering-python-dbt",
      amount: 449000,
      status: "COMPLETED",
      paymentMethod: "BANK_TRANSFER",
      paymentId: "seed_bca_013",
      paidDaysAgo: 35,
      createdDaysAgo: 35,
    },
    {
      user: bagus,
      courseSlug: "docker-kubernetes-web-developers",
      amount: 399000,
      status: "COMPLETED",
      paymentMethod: "QRIS",
      paymentId: "seed_qris_014",
      paidDaysAgo: 80,
      createdDaysAgo: 80,
    },
    {
      user: citra,
      courseSlug: "figma-to-code-design-systems",
      amount: 299000,
      status: "COMPLETED",
      paymentMethod: "GOPAY",
      paymentId: "seed_gopay_015",
      paidDaysAgo: 55,
      createdDaysAgo: 55,
    },
    {
      user: citra,
      courseSlug: "product-discovery-for-engineers",
      amount: 199000,
      status: "COMPLETED",
      paymentMethod: "DANA",
      paymentId: "seed_dana_016",
      paidDaysAgo: 22,
      createdDaysAgo: 22,
    },
    {
      user: dimas,
      courseSlug: "nextjs-15-fullstack-saas",
      amount: 174500,
      status: "COMPLETED",
      paymentMethod: "QRIS",
      paymentId: "seed_qris_017",
      paidDaysAgo: 14,
      createdDaysAgo: 14,
      couponCode: "RAMADAN50",
    },
    {
      user: gita,
      courseSlug: "react-native-cross-platform",
      amount: 349000,
      status: "COMPLETED",
      paymentMethod: "BANK_TRANSFER",
      paymentId: "seed_bca_018",
      paidDaysAgo: 30,
      createdDaysAgo: 30,
    },
    {
      user: gita,
      courseSlug: "typescript-mastery-zero-to-production",
      amount: 279000,
      status: "REFUNDED",
      paymentMethod: "GOPAY",
      paymentId: "seed_gopay_019",
      paidDaysAgo: 110,
      refundedDaysAgo: 95,
      createdDaysAgo: 110,
    },
    {
      user: hadi,
      courseSlug: "web-app-security-fundamentals",
      amount: 329000,
      status: "COMPLETED",
      paymentMethod: "BANK_TRANSFER",
      paymentId: "seed_mandiri_020",
      paidDaysAgo: 50,
      createdDaysAgo: 50,
    },
    {
      user: hadi,
      courseSlug: "docker-kubernetes-web-developers",
      amount: 399000,
      status: "COMPLETED",
      paymentMethod: "QRIS",
      paymentId: "seed_qris_021",
      paidDaysAgo: 90,
      createdDaysAgo: 90,
    },
    {
      user: dimas,
      courseSlug: "advanced-postgres-app-developers",
      amount: 359000,
      status: "PENDING",
      paymentMethod: "BANK_TRANSFER",
      createdDaysAgo: 1,
    },
  ]

  for (const o of orderSpecs) {
    const couponId = o.couponCode
      ? coupons.find((c) => c.code === o.couponCode)?.id
      : null
    await prisma.order.create({
      data: {
        userId: o.user.id,
        courseId: courseBy(o.courseSlug).id,
        couponId: couponId ?? null,
        amount: o.amount,
        status: o.status,
        paymentMethod: o.paymentMethod ?? null,
        paymentId: o.paymentId ?? null,
        paidAt: o.paidDaysAgo !== undefined ? daysAgo(o.paidDaysAgo) : null,
        refundedAt: o.refundedDaysAgo !== undefined ? daysAgo(o.refundedDaysAgo) : null,
        createdAt: daysAgo(o.createdDaysAgo),
        metadata: {
          mock: true,
          seedSample: true,
          ...(o.failReason ? { reason: o.failReason } : {}),
        },
      },
    })
  }

  console.log(`  Orders created (${orderSpecs.length})`)

  // ============================================================
  // WISHLIST
  // ============================================================

  const wishlistSpecs = [
    { user: alan, slug: "data-engineering-python-dbt" },
    { user: alan, slug: "web-app-security-fundamentals" },
    { user: alan, slug: "react-native-cross-platform" },
    { user: maya, slug: "practical-ai-engineering-llms" },
    { user: maya, slug: "product-discovery-for-engineers" },
    { user: aditya, slug: "react-native-cross-platform" },
    { user: aditya, slug: "practical-ai-engineering-llms" },
    { user: fajar, slug: "docker-kubernetes-web-developers" },
    { user: intan, slug: "figma-to-code-design-systems" },
    { user: citra, slug: "ux-research-methods-practical" },
    { user: dimas, slug: "typescript-mastery-zero-to-production" },
    { user: bagus, slug: "practical-ai-engineering-llms" },
    { user: hadi, slug: "data-engineering-python-dbt" },
    { user: gita, slug: "figma-to-code-design-systems" },
  ]
  for (const w of wishlistSpecs) {
    await prisma.wishlistItem.create({
      data: { userId: w.user.id, courseId: courseBy(w.slug).id },
    })
  }
  console.log(`  Wishlist items created (${wishlistSpecs.length})`)

  // ============================================================
  // DISCUSSIONS + REPLIES
  // ============================================================

  const nextChapter1Lesson = nextLessons[0]
  const nextChapter2Lesson1 = nextLessons.find((l) => l.title === "Server vs Client components")
  const tsLesson1 = tsLessons[0]
  const k8sLesson1 = k8sLessons[0]

  if (nextChapter1Lesson && nextChapter2Lesson1 && tsLesson1 && k8sLesson1) {
    const d1 = await prisma.discussion.create({
      data: {
        lessonId: nextChapter1Lesson.id,
        userId: aditya.id,
        body: "Apakah folder structure di sini bisa diadaptasi untuk app yang sudah running 2 tahun?",
        createdAt: daysAgo(20),
      },
    })
    await prisma.discussionReply.createMany({
      data: [
        {
          discussionId: d1.id,
          userId: rina.id,
          body: "Bisa banget. Kuncinya migrasi bertahap — pindahkan satu route group dulu, jangan coba semuanya sekaligus.",
          createdAt: daysAgo(19),
        },
        {
          discussionId: d1.id,
          userId: maya.id,
          body: "Aku sudah coba dan berhasil. Mulai dari folder marketing yang biasanya simpel.",
          createdAt: daysAgo(18),
        },
      ],
    })

    const d2 = await prisma.discussion.create({
      data: {
        lessonId: nextChapter2Lesson1.id,
        userId: alan.id,
        body: "Kalau component bersifat presentational tapi nested di server component, lebih baik server atau client?",
        createdAt: daysAgo(12),
      },
    })
    await prisma.discussionReply.create({
      data: {
        discussionId: d2.id,
        userId: rina.id,
        body: "Server, kecuali butuh state/event handler. Default-nya server, naik ke client hanya saat perlu.",
        createdAt: daysAgo(11),
      },
    })

    const d3 = await prisma.discussion.create({
      data: {
        lessonId: tsLesson1.id,
        userId: gita.id,
        body: "Apakah strict mode wajib dari awal project, atau bisa di-enable bertahap?",
        createdAt: daysAgo(8),
      },
    })
    await prisma.discussionReply.create({
      data: {
        discussionId: d3.id,
        userId: rina.id,
        body: "Project baru: wajib strict. Project legacy: noImplicitAny dulu, lalu naikkan satu flag per sprint.",
        createdAt: daysAgo(7),
      },
    })

    await prisma.discussion.create({
      data: {
        lessonId: k8sLesson1.id,
        userId: bagus.id,
        body: "Untuk project kecil dengan 2 service, apakah Compose masih relevan?",
        createdAt: daysAgo(4),
      },
    })
  }

  console.log("  Discussions created")

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  await prisma.notification.createMany({
    data: [
      {
        userId: alan.id,
        type: "CERTIFICATE_ISSUED",
        title: "Sertifikat Diterbitkan",
        message: "Selamat! Kamu mendapatkan sertifikat untuk REST API with Laravel 11.",
        isRead: false,
        metadata: { courseId: courseBy("rest-api-laravel-11-postgresql").id },
        createdAt: daysAgo(50),
      },
      {
        userId: alan.id,
        type: "ENROLLMENT",
        title: "Berhasil Mendaftar",
        message: "Kamu berhasil mendaftar ke Practical AI Engineering with LLMs.",
        isRead: false,
        metadata: { courseId: courseBy("practical-ai-engineering-llms").id },
        createdAt: daysAgo(20),
      },
      {
        userId: alan.id,
        type: "QUIZ_PASSED",
        title: "Quiz Lulus!",
        message: "Skor kamu 100 untuk Quiz App Router Concepts.",
        isRead: true,
        metadata: { courseId: courseBy("nextjs-15-fullstack-saas").id },
        createdAt: daysAgo(40),
      },
      {
        userId: alan.id,
        type: "COURSE_UPDATE",
        title: "Konten Kursus Diperbarui",
        message: "Next.js 15 SaaS — 3 lesson baru di bab Stripe.",
        isRead: true,
        metadata: { courseId: courseBy("nextjs-15-fullstack-saas").id },
        createdAt: daysAgo(30),
      },
      {
        userId: alan.id,
        type: "DISCUSSION_REPLY",
        title: "Balasan Diskusi",
        message: "Rina membalas pertanyaan kamu di lesson Server vs Client components.",
        isRead: false,
        metadata: { courseId: courseBy("nextjs-15-fullstack-saas").id },
        createdAt: daysAgo(11),
      },
      {
        userId: aditya.id,
        type: "CERTIFICATE_ISSUED",
        title: "Sertifikat Diterbitkan",
        message: "Kursus Next.js 15 SaaS selesai. Sertifikat siap diunduh.",
        isRead: true,
        metadata: { courseId: courseBy("nextjs-15-fullstack-saas").id },
        createdAt: daysAgo(25),
      },
      {
        userId: maya.id,
        type: "QUIZ_FAILED",
        title: "Quiz Belum Lulus",
        message: "Skor 60 untuk Quiz App Router. Coba ulang sampai 75.",
        isRead: true,
        metadata: { courseId: courseBy("nextjs-15-fullstack-saas").id },
        createdAt: daysAgo(36),
      },
      {
        userId: maya.id,
        type: "CERTIFICATE_ISSUED",
        title: "Sertifikat Diterbitkan",
        message: "Next.js 15 SaaS — sertifikat baru!",
        isRead: false,
        metadata: { courseId: courseBy("nextjs-15-fullstack-saas").id },
        createdAt: daysAgo(30),
      },
      {
        userId: rina.id,
        type: "NEW_REVIEW",
        title: "Review Baru ⭐⭐⭐⭐⭐",
        message: "Aditya memberi review 5 bintang untuk Next.js 15 SaaS.",
        isRead: false,
        metadata: { courseId: courseBy("nextjs-15-fullstack-saas").id },
        createdAt: daysAgo(22),
      },
      {
        userId: rina.id,
        type: "ENROLLMENT",
        title: "Pendaftar Baru",
        message: "Dimas mendaftar kursus Next.js 15 SaaS.",
        isRead: true,
        metadata: { courseId: courseBy("nextjs-15-fullstack-saas").id },
        createdAt: daysAgo(14),
      },
      {
        userId: budi.id,
        type: "NEW_REVIEW",
        title: "Review Baru",
        message: "Citra memberi review 4 bintang untuk Figma to Code.",
        isRead: false,
        metadata: { courseId: courseBy("figma-to-code-design-systems").id },
        createdAt: daysAgo(25),
      },
      {
        userId: dewi.id,
        type: "COURSE_APPROVED",
        title: "Kursus Disetujui",
        message: "React Native — Build Cross-Platform Mobile Apps telah disetujui.",
        isRead: true,
        metadata: { courseId: courseBy("react-native-cross-platform").id },
        createdAt: daysAgo(65),
      },
      {
        userId: sari.id,
        type: "COURSE_REJECTED",
        title: "Revisi Diperlukan",
        message: "Advanced Postgres — silakan lengkapi modul tentang replication sebelum di-publish.",
        isRead: false,
        metadata: { courseId: courseBy("advanced-postgres-app-developers").id },
        createdAt: daysAgo(2),
      },
      {
        userId: rizky.id,
        type: "NEW_REVIEW",
        title: "Review Baru",
        message: "Hadi memberi review 4 bintang untuk Docker & Kubernetes.",
        isRead: false,
        metadata: { courseId: courseBy("docker-kubernetes-web-developers").id },
        createdAt: daysAgo(20),
      },
      {
        userId: admin.id,
        type: "COURSE_UPDATE",
        title: "Course Pending Review",
        message: "Advanced Postgres for Application Developers menunggu review.",
        isRead: false,
        metadata: { courseId: courseBy("advanced-postgres-app-developers").id },
        createdAt: daysAgo(5),
      },
    ],
  })

  console.log("  Notifications created")

  // ============================================================
  // PAYOUTS — instructor withdrawals
  // ============================================================

  await prisma.payout.createMany({
    data: [
      {
        instructorId: rina.id,
        amount: 5_500_000,
        platformFee: 550_000,
        status: "APPROVED",
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "Rina Maharani",
        note: "Payout untuk April 2026",
        requestedAt: daysAgo(28),
        processedAt: daysAgo(25),
        processedBy: admin.id,
      },
      {
        instructorId: rina.id,
        amount: 3_200_000,
        platformFee: 320_000,
        status: "PENDING",
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "Rina Maharani",
        requestedAt: daysAgo(3),
      },
      {
        instructorId: budi.id,
        amount: 2_100_000,
        platformFee: 210_000,
        status: "APPROVED",
        bankName: "Mandiri",
        accountNumber: "9876543210",
        accountHolder: "Budi Santoso",
        requestedAt: daysAgo(40),
        processedAt: daysAgo(38),
        processedBy: admin.id,
      },
      {
        instructorId: budi.id,
        amount: 850_000,
        platformFee: 85_000,
        status: "PENDING",
        bankName: "Mandiri",
        accountNumber: "9876543210",
        accountHolder: "Budi Santoso",
        requestedAt: daysAgo(2),
      },
      {
        instructorId: sari.id,
        amount: 1_400_000,
        platformFee: 140_000,
        status: "REJECTED",
        bankName: "BNI",
        accountNumber: "5544332211",
        accountHolder: "Sari Dewii", // typo on purpose
        rejectReason: "Nama pemilik rekening tidak cocok dengan akun.",
        requestedAt: daysAgo(15),
        processedAt: daysAgo(14),
        processedBy: admin.id,
      },
      {
        instructorId: rizky.id,
        amount: 1_750_000,
        platformFee: 175_000,
        status: "APPROVED",
        bankName: "BCA",
        accountNumber: "1122334455",
        accountHolder: "Rizky Firmansyah",
        requestedAt: daysAgo(35),
        processedAt: daysAgo(33),
        processedBy: admin.id,
      },
      {
        instructorId: dewi.id,
        amount: 980_000,
        platformFee: 98_000,
        status: "PENDING",
        bankName: "BCA",
        accountNumber: "9988776655",
        accountHolder: "Dewi Kartika",
        requestedAt: daysAgo(1),
      },
    ],
  })

  console.log("  Payouts created")

  console.log("\nSeed complete!")
  console.log("\nTest accounts (password: Password1):")
  console.log("  ADMIN    mail.alanari@gmail.com")
  console.log("  TEACHER  rina@learnify.id, budi@learnify.id, sari@learnify.id, rizky@learnify.id, dewi@learnify.id")
  console.log("  STUDENT  alan@example.com, aditya@example.com, maya@example.com, fajar@example.com, intan@example.com,")
  console.log("           bagus@example.com, citra@example.com, dimas@example.com, eka@example.com, gita@example.com,")
  console.log("           hadi@example.com, joko@example.com")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
