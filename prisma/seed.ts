// prisma/seed.ts
// Seed database with mock data for development
// Run: npx prisma db seed

import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { hashSync } from "bcryptjs"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const hash = (pw: string) => hashSync(pw, 12)

async function main() {
  console.log("Seeding database...")

  // ============================================================
  // USERS (instructors + students)
  // ============================================================

  const rina = await prisma.user.upsert({
    where: { email: "rina@learnify.id" },
    update: {},
    create: {
      id: "inst-1",
      email: "rina@learnify.id",
      emailVerified: true,
      name: "Rina Maharani",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=rina",
      role: "TEACHER",
      credentials: { create: { provider: "EMAIL", passwordHash: hash("Password1") } },
    },
  })

  const budi = await prisma.user.upsert({
    where: { email: "budi@learnify.id" },
    update: {},
    create: {
      id: "inst-2",
      email: "budi@learnify.id",
      emailVerified: true,
      name: "Budi Santoso",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=budi",
      role: "TEACHER",
      credentials: { create: { provider: "EMAIL", passwordHash: hash("Password1") } },
    },
  })

  const sari = await prisma.user.upsert({
    where: { email: "sari@learnify.id" },
    update: {},
    create: {
      id: "inst-3",
      email: "sari@learnify.id",
      emailVerified: true,
      name: "Sari Dewi",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=sari",
      role: "TEACHER",
      credentials: { create: { provider: "EMAIL", passwordHash: hash("Password1") } },
    },
  })

  const rizky = await prisma.user.upsert({
    where: { email: "rizky@learnify.id" },
    update: {},
    create: {
      id: "inst-4",
      email: "rizky@learnify.id",
      emailVerified: true,
      name: "Rizky Firmansyah",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=rizky",
      role: "TEACHER",
      credentials: { create: { provider: "EMAIL", passwordHash: hash("Password1") } },
    },
  })

  const alan = await prisma.user.upsert({
    where: { email: "alan@example.com" },
    update: {},
    create: {
      id: "user-1",
      email: "alan@example.com",
      emailVerified: true,
      name: "Alan Ari Mahendra",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=alan",
      role: "STUDENT",
      credentials: { create: { provider: "EMAIL", passwordHash: hash("Password1") } },
    },
  })

  // Review students
  const aditya = await prisma.user.upsert({
    where: { email: "aditya@example.com" },
    update: {},
    create: {
      id: "stu-1",
      email: "aditya@example.com",
      emailVerified: true,
      name: "Aditya Pratama",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=aditya",
      role: "STUDENT",
      credentials: { create: { provider: "EMAIL", passwordHash: hash("Password1") } },
    },
  })

  const maya = await prisma.user.upsert({
    where: { email: "maya@example.com" },
    update: {},
    create: {
      id: "stu-2",
      email: "maya@example.com",
      emailVerified: true,
      name: "Maya Indira",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=maya",
      role: "STUDENT",
      credentials: { create: { provider: "EMAIL", passwordHash: hash("Password1") } },
    },
  })

  const fajar = await prisma.user.upsert({
    where: { email: "fajar@example.com" },
    update: {},
    create: {
      id: "stu-3",
      email: "fajar@example.com",
      emailVerified: true,
      name: "Fajar Nugroho",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=fajar",
      role: "STUDENT",
      credentials: { create: { provider: "EMAIL", passwordHash: hash("Password1") } },
    },
  })

  console.log("  Users created")

  // ============================================================
  // CATEGORIES
  // ============================================================

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "web-development" },
      update: {},
      create: { id: "cat-1", name: "Web Development", slug: "web-development", description: "Frontend & backend web development" },
    }),
    prisma.category.upsert({
      where: { slug: "ui-ux-design" },
      update: {},
      create: { id: "cat-2", name: "UI/UX Design", slug: "ui-ux-design", description: "User interface and experience design" },
    }),
    prisma.category.upsert({
      where: { slug: "data-science" },
      update: {},
      create: { id: "cat-3", name: "Data Science", slug: "data-science", description: "Data analysis, ML, and AI" },
    }),
    prisma.category.upsert({
      where: { slug: "mobile-development" },
      update: {},
      create: { id: "cat-4", name: "Mobile Development", slug: "mobile-development", description: "iOS and Android development" },
    }),
    prisma.category.upsert({
      where: { slug: "devops" },
      update: {},
      create: { id: "cat-5", name: "DevOps", slug: "devops", description: "CI/CD, containerization, and cloud" },
    }),
  ])

  console.log("  Categories created")

  // ============================================================
  // COURSES
  // ============================================================

  // Helper: delete existing courses to allow re-seed (cascade removes chapters/lessons/etc)
  await prisma.course.deleteMany({ where: { id: { in: ["course-1", "course-2", "course-3", "course-4", "course-5", "course-6", "course-7", "course-8"] } } })

  const course1 = await prisma.course.create({
    data: {
      id: "course-1",
      title: "Next.js 14 — Build Full Stack SaaS Applications",
      slug: "nextjs-14-fullstack-saas",
      description: "Master Next.js 14 App Router by building a production-grade SaaS application from scratch. Covers server components, server actions, authentication, Prisma ORM, Stripe payments, and deployment.",
      shortDesc: "Build a production SaaS app with Next.js 14, Prisma, and Stripe.",
      thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      price: 349000,
      isFree: false,
      status: "PUBLISHED",
      level: "INTERMEDIATE",
      language: "id",
      totalDuration: 68400,
      totalLessons: 52,
      requirements: ["Basic React knowledge (components, hooks, state)", "Familiar with JavaScript/TypeScript", "Basic understanding of REST APIs"],
      outcomes: ["Build production-grade Next.js applications", "Implement authentication with NextAuth.js", "Design and manage PostgreSQL databases with Prisma", "Integrate Stripe for subscription payments", "Deploy to Vercel with CI/CD", "Write clean, maintainable TypeScript code"],
      rating: 4.9,
      reviewCount: 312,
      enrollmentCount: 1840,
      publishedAt: new Date("2025-01-15T00:00:00Z"),
      createdAt: new Date("2025-01-10T00:00:00Z"),
      instructorId: rina.id,
      categoryId: "cat-1",
    },
  })

  const course2 = await prisma.course.create({
    data: {
      id: "course-2",
      title: "Figma to Code — Design Systems for Developers",
      slug: "figma-to-code-design-systems",
      description: "Learn how to translate Figma designs into pixel-perfect React components. Build a complete design system with Tailwind CSS and shadcn/ui while mastering component architecture and design tokens.",
      shortDesc: "Translate Figma designs into a production-ready component library.",
      thumbnailUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
      price: 299000,
      isFree: false,
      status: "PUBLISHED",
      level: "INTERMEDIATE",
      language: "id",
      totalDuration: 43200,
      totalLessons: 38,
      requirements: ["Basic HTML & CSS", "Familiar with React components", "No Figma experience required"],
      outcomes: ["Read and interpret Figma design files", "Build a scalable component library", "Implement design tokens with Tailwind CSS", "Create consistent UI with shadcn/ui", "Document components with Storybook"],
      rating: 4.7,
      reviewCount: 187,
      enrollmentCount: 920,
      publishedAt: new Date("2025-02-05T00:00:00Z"),
      createdAt: new Date("2025-02-01T00:00:00Z"),
      instructorId: budi.id,
      categoryId: "cat-2",
    },
  })

  const course3 = await prisma.course.create({
    data: {
      id: "course-3",
      title: "REST API with Laravel 11 & PostgreSQL",
      slug: "rest-api-laravel-11-postgresql",
      description: "Build robust, scalable REST APIs using Laravel 11. Covers authentication with Sanctum, resource controllers, API versioning, request validation, rate limiting, and testing with PHPUnit.",
      shortDesc: "Build scalable REST APIs with Laravel 11 and PostgreSQL.",
      thumbnailUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
      price: 0,
      isFree: true,
      status: "PUBLISHED",
      level: "BEGINNER",
      language: "id",
      totalDuration: 32400,
      totalLessons: 29,
      requirements: ["Basic PHP knowledge", "Understand what an API is"],
      outcomes: ["Build RESTful APIs with Laravel 11", "Implement token-based auth with Sanctum", "Write database migrations and seeders", "Test APIs with Postman and PHPUnit", "Handle errors and validation properly"],
      rating: 4.8,
      reviewCount: 543,
      enrollmentCount: 3210,
      publishedAt: new Date("2024-11-05T00:00:00Z"),
      createdAt: new Date("2024-11-01T00:00:00Z"),
      instructorId: rina.id,
      categoryId: "cat-1",
    },
  })

  const course4 = await prisma.course.create({
    data: {
      id: "course-4",
      title: "Data Engineering with Python & dbt",
      slug: "data-engineering-python-dbt",
      description: "Learn modern data engineering practices using Python, Apache Airflow, dbt, and BigQuery. Build end-to-end data pipelines and analytics infrastructure from scratch.",
      shortDesc: "Build production data pipelines with Python, Airflow, and dbt.",
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      price: 449000,
      isFree: false,
      status: "PUBLISHED",
      level: "ADVANCED",
      language: "id",
      totalDuration: 79200,
      totalLessons: 61,
      requirements: ["Python fundamentals (functions, loops, files)", "Basic SQL knowledge", "Comfortable with command line"],
      outcomes: ["Build batch and streaming data pipelines", "Orchestrate workflows with Apache Airflow", "Transform data with dbt", "Load data into BigQuery and Snowflake", "Implement data quality checks", "Monitor pipeline health"],
      rating: 4.8,
      reviewCount: 98,
      enrollmentCount: 540,
      publishedAt: new Date("2025-03-10T00:00:00Z"),
      createdAt: new Date("2025-03-01T00:00:00Z"),
      instructorId: sari.id,
      categoryId: "cat-3",
    },
  })

  const course5 = await prisma.course.create({
    data: {
      id: "course-5",
      title: "Docker & Kubernetes for Web Developers",
      slug: "docker-kubernetes-web-developers",
      description: "Containerize your web applications and deploy them to Kubernetes. Covers Docker fundamentals, Docker Compose, Kubernetes concepts, Helm charts, and deploying to a managed cluster.",
      shortDesc: "Containerize and deploy web apps with Docker and Kubernetes.",
      thumbnailUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
      price: 399000,
      isFree: false,
      status: "PUBLISHED",
      level: "INTERMEDIATE",
      language: "id",
      totalDuration: 54000,
      totalLessons: 44,
      requirements: ["Basic Linux command line", "Deployed at least one web app to a VPS or cloud provider"],
      outcomes: ["Write production-ready Dockerfiles", "Orchestrate multi-container apps with Compose", "Understand Kubernetes core concepts", "Deploy apps to a Kubernetes cluster", "Set up CI/CD with GitHub Actions"],
      rating: 4.6,
      reviewCount: 134,
      enrollmentCount: 670,
      publishedAt: new Date("2025-01-25T00:00:00Z"),
      createdAt: new Date("2025-01-20T00:00:00Z"),
      instructorId: rizky.id,
      categoryId: "cat-5",
    },
  })

  const course6 = await prisma.course.create({
    data: {
      id: "course-6",
      title: "TypeScript Mastery — From Zero to Production",
      slug: "typescript-mastery-zero-to-production",
      description: "Master TypeScript from the ground up. Covers type system fundamentals, generics, utility types, decorators, and real-world patterns used in production Node.js and React codebases.",
      shortDesc: "Master TypeScript with real-world patterns for React and Node.js.",
      thumbnailUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
      price: 279000,
      isFree: false,
      status: "PUBLISHED",
      level: "BEGINNER",
      language: "id",
      totalDuration: 36000,
      totalLessons: 33,
      requirements: ["JavaScript fundamentals", "Basic understanding of functions and objects"],
      outcomes: ["Understand the TypeScript type system", "Write type-safe React components", "Use generics and utility types", "Configure tsconfig for different environments", "Apply TypeScript in real projects"],
      rating: 4.9,
      reviewCount: 421,
      enrollmentCount: 2340,
      publishedAt: new Date("2024-10-20T00:00:00Z"),
      createdAt: new Date("2024-10-15T00:00:00Z"),
      instructorId: rina.id,
      categoryId: "cat-1",
    },
  })

  const course7 = await prisma.course.create({
    data: {
      id: "course-7",
      title: "React Native — Build Cross-Platform Mobile Apps",
      slug: "react-native-cross-platform",
      description: "Build iOS and Android apps with React Native and Expo. Covers navigation, state management, native APIs, push notifications, and deploying to the App Store and Google Play.",
      shortDesc: "Build iOS & Android apps with React Native and Expo.",
      thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
      price: 349000,
      isFree: false,
      status: "PUBLISHED",
      level: "INTERMEDIATE",
      language: "id",
      totalDuration: 57600,
      totalLessons: 48,
      requirements: ["React fundamentals (hooks, components)", "Basic JavaScript/TypeScript"],
      outcomes: ["Build cross-platform mobile apps", "Implement navigation with Expo Router", "Manage state with Zustand", "Access native device features", "Publish to App Store and Google Play"],
      rating: 4.7,
      reviewCount: 156,
      enrollmentCount: 780,
      publishedAt: new Date("2025-02-20T00:00:00Z"),
      createdAt: new Date("2025-02-15T00:00:00Z"),
      instructorId: budi.id,
      categoryId: "cat-4",
    },
  })

  const course8 = await prisma.course.create({
    data: {
      id: "course-8",
      title: "UX Research — Methods & Practical Application",
      slug: "ux-research-methods-practical",
      description: "Learn how to conduct effective UX research. Covers user interviews, usability testing, surveys, competitive analysis, affinity mapping, and communicating findings to stakeholders.",
      shortDesc: "Master UX research methods and translate findings into design decisions.",
      thumbnailUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80",
      price: 0,
      isFree: true,
      status: "PUBLISHED",
      level: "BEGINNER",
      language: "id",
      totalDuration: 25200,
      totalLessons: 24,
      requirements: ["No prior UX experience needed", "Willingness to conduct interviews and gather user feedback"],
      outcomes: ["Plan and conduct user interviews", "Run moderated usability tests", "Synthesize research with affinity mapping", "Create research reports for stakeholders", "Prioritize features based on user evidence"],
      rating: 4.8,
      reviewCount: 289,
      enrollmentCount: 1920,
      publishedAt: new Date("2024-12-05T00:00:00Z"),
      createdAt: new Date("2024-12-01T00:00:00Z"),
      instructorId: budi.id,
      categoryId: "cat-2",
    },
  })

  console.log("  Courses created")

  // ============================================================
  // CHAPTERS & LESSONS (course-1 detail)
  // ============================================================

  await prisma.chapter.create({
    data: {
      id: "ch-1",
      title: "Getting Started",
      description: "Project overview and environment setup",
      position: 1,
      isFree: true,
      courseId: course1.id,
      lessons: {
        create: [
          { id: "les-1", title: "What we're building", type: "VIDEO", position: 1, isFree: true, duration: 480, description: "Overview of the final project" },
          { id: "les-2", title: "Project setup & folder structure", type: "VIDEO", position: 2, isFree: true, duration: 720 },
          { id: "les-3", title: "Configuring Tailwind & shadcn/ui", type: "VIDEO", position: 3, isFree: false, duration: 600 },
        ],
      },
    },
  })

  await prisma.chapter.create({
    data: {
      id: "ch-2",
      title: "App Router Deep Dive",
      description: "Server components, layouts, and routing patterns",
      position: 2,
      isFree: false,
      courseId: course1.id,
      lessons: {
        create: [
          { id: "les-4", title: "Server vs Client components", type: "VIDEO", position: 1, isFree: false, duration: 900 },
          { id: "les-5", title: "Nested layouts & route groups", type: "VIDEO", position: 2, isFree: false, duration: 840, description: "Learn how Next.js App Router handles nested layouts and route groups.", content: "In this lesson, you'll learn:\n\n1. How layouts nest automatically in the App Router\n2. Route groups with parentheses — (marketing), (dashboard), (player)\n3. Shared layouts vs. per-route layouts\n4. When to use layout.tsx vs. template.tsx\n5. Practical example: building Learnify's layout structure" },
          { id: "les-6", title: "Loading UI & Suspense", type: "VIDEO", position: 3, isFree: false, duration: 660 },
          { id: "les-7", title: "Error boundaries", type: "VIDEO", position: 4, isFree: false, duration: 540 },
          { id: "les-8", title: "Quiz — App Router Concepts", type: "QUIZ", position: 5, isFree: false },
        ],
      },
    },
  })

  await prisma.chapter.create({
    data: {
      id: "ch-3",
      title: "Authentication with Supabase",
      description: "Auth flow, sessions, and protected routes",
      position: 3,
      isFree: false,
      courseId: course1.id,
      lessons: {
        create: [
          { id: "les-9", title: "Supabase project setup", type: "VIDEO", position: 1, isFree: false, duration: 780 },
          { id: "les-10", title: "Email & password sign up", type: "VIDEO", position: 2, isFree: false, duration: 900 },
          { id: "les-11", title: "Session management with cookies", type: "VIDEO", position: 3, isFree: false, duration: 720 },
          { id: "les-12", title: "Middleware & protected routes", type: "VIDEO", position: 4, isFree: false, duration: 840 },
        ],
      },
    },
  })

  await prisma.chapter.create({
    data: {
      id: "ch-4",
      title: "Database with Prisma + Supabase",
      description: "Schema design, migrations, and queries",
      position: 4,
      isFree: false,
      courseId: course1.id,
      lessons: {
        create: [
          { id: "les-13", title: "Prisma schema design", type: "VIDEO", position: 1, isFree: false, duration: 1080 },
          { id: "les-14", title: "Migrations & seed data", type: "VIDEO", position: 2, isFree: false, duration: 720 },
          { id: "les-15", title: "Prisma schema reference", type: "ATTACHMENT", position: 3, isFree: false },
        ],
      },
    },
  })

  await prisma.chapter.create({
    data: {
      id: "ch-5",
      title: "Stripe Payments",
      description: "Subscription billing and webhook handling",
      position: 5,
      isFree: false,
      courseId: course1.id,
      lessons: {
        create: [
          { id: "les-16", title: "Stripe Checkout integration", type: "VIDEO", position: 1, isFree: false, duration: 960 },
          { id: "les-17", title: "Webhook handling", type: "VIDEO", position: 2, isFree: false, duration: 900 },
          { id: "les-18", title: "Subscription management", type: "VIDEO", position: 3, isFree: false, duration: 840 },
        ],
      },
    },
  })

  console.log("  Chapters & lessons created")

  // ============================================================
  // ATTACHMENTS (course-1)
  // ============================================================

  await prisma.attachment.createMany({
    data: [
      { id: "att-1", name: "Prisma Schema Starter.prisma", url: "#", size: 4200, mimeType: "text/plain", courseId: course1.id },
      { id: "att-2", name: "Project Boilerplate.zip", url: "#", size: 2048000, mimeType: "application/zip", courseId: course1.id },
      { id: "att-3", name: "Deployment Checklist.pdf", url: "#", size: 180000, mimeType: "application/pdf", courseId: course1.id },
    ],
  })

  console.log("  Attachments created")

  // ============================================================
  // QUIZ (lesson les-8)
  // ============================================================

  await prisma.quiz.create({
    data: {
      id: "quiz-1",
      title: "Quiz — App Router Concepts",
      passingScore: 75,
      allowRetake: true,
      maxAttempts: 3,
      timeLimit: 600,
      lessonId: "les-8",
      questions: {
        create: [
          {
            id: "q-1",
            text: "Apa perbedaan utama antara Server Component dan Client Component di Next.js?",
            explanation: "Server Components dirender di server dan tidak mengirim JavaScript ke browser. Client Components dirender di browser dan membutuhkan 'use client' directive.",
            position: 1,
            points: 25,
            options: {
              create: [
                { id: "q1-a", text: "Server Component dirender di server, Client Component dirender di browser", isCorrect: true, position: 1 },
                { id: "q1-b", text: "Server Component lebih cepat karena menggunakan cache", isCorrect: false, position: 2 },
                { id: "q1-c", text: "Client Component tidak bisa mengakses database", isCorrect: false, position: 3 },
                { id: "q1-d", text: "Tidak ada perbedaan, hanya penamaan berbeda", isCorrect: false, position: 4 },
              ],
            },
          },
          {
            id: "q-2",
            text: "Bagaimana cara membuat route group di App Router?",
            explanation: "Route group dibuat dengan membungkus nama folder dalam tanda kurung, misalnya (marketing). Folder ini tidak mempengaruhi URL path.",
            position: 2,
            points: 25,
            options: {
              create: [
                { id: "q2-a", text: "Menggunakan underscore: _marketing/page.tsx", isCorrect: false, position: 1 },
                { id: "q2-b", text: "Menggunakan tanda kurung: (marketing)/page.tsx", isCorrect: true, position: 2 },
                { id: "q2-c", text: "Menggunakan bracket: [marketing]/page.tsx", isCorrect: false, position: 3 },
                { id: "q2-d", text: "Menggunakan config di next.config.ts", isCorrect: false, position: 4 },
              ],
            },
          },
          {
            id: "q-3",
            text: "Apa fungsi file loading.tsx dalam App Router?",
            explanation: "loading.tsx menampilkan UI loading otomatis menggunakan React Suspense saat konten halaman sedang dimuat.",
            position: 3,
            points: 25,
            options: {
              create: [
                { id: "q3-a", text: "Menampilkan animasi loading saat aplikasi pertama kali dibuka", isCorrect: false, position: 1 },
                { id: "q3-b", text: "Menampilkan skeleton UI otomatis via Suspense saat halaman dimuat", isCorrect: true, position: 2 },
                { id: "q3-c", text: "Mengatur timeout untuk API request", isCorrect: false, position: 3 },
                { id: "q3-d", text: "Menampilkan progress bar di atas halaman", isCorrect: false, position: 4 },
              ],
            },
          },
          {
            id: "q-4",
            text: "Kapan sebaiknya menggunakan 'use client' directive?",
            explanation: "Gunakan 'use client' hanya ketika component membutuhkan interaktivitas browser seperti useState, useEffect, onClick, atau browser API lainnya.",
            position: 4,
            points: 25,
            options: {
              create: [
                { id: "q4-a", text: "Di setiap component agar bisa menggunakan hooks", isCorrect: false, position: 1 },
                { id: "q4-b", text: "Hanya di layout.tsx", isCorrect: false, position: 2 },
                { id: "q4-c", text: "Ketika component butuh interaktivitas: state, effects, atau event handlers", isCorrect: true, position: 3 },
                { id: "q4-d", text: "Ketika component mengambil data dari database", isCorrect: false, position: 4 },
              ],
            },
          },
        ],
      },
    },
  })

  console.log("  Quiz created")

  // ============================================================
  // ENROLLMENTS (alan → course-1, course-3, course-6)
  // ============================================================

  await prisma.enrollment.createMany({
    data: [
      { id: "enr-1", userId: alan.id, courseId: course1.id, progressPercent: 62, enrolledAt: new Date("2025-02-01T00:00:00Z") },
      { id: "enr-2", userId: alan.id, courseId: course3.id, progressPercent: 100, enrolledAt: new Date("2025-01-20T00:00:00Z"), completedAt: new Date("2025-03-10T00:00:00Z") },
      { id: "enr-3", userId: alan.id, courseId: course6.id, progressPercent: 28, enrolledAt: new Date("2025-03-01T00:00:00Z") },
    ],
  })

  console.log("  Enrollments created")

  // ============================================================
  // LESSON PROGRESS (alan, course-1)
  // ============================================================

  await prisma.lessonProgress.createMany({
    data: [
      { id: "lp-1", userId: alan.id, lessonId: "les-1", isCompleted: true, completedAt: new Date("2025-02-02T00:00:00Z"), watchedSeconds: 480 },
      { id: "lp-2", userId: alan.id, lessonId: "les-2", isCompleted: true, completedAt: new Date("2025-02-02T00:00:00Z"), watchedSeconds: 720 },
      { id: "lp-3", userId: alan.id, lessonId: "les-3", isCompleted: true, completedAt: new Date("2025-02-03T00:00:00Z"), watchedSeconds: 600 },
      { id: "lp-4", userId: alan.id, lessonId: "les-4", isCompleted: true, completedAt: new Date("2025-02-05T00:00:00Z"), watchedSeconds: 900 },
      { id: "lp-5", userId: alan.id, lessonId: "les-5", isCompleted: false, watchedSeconds: 320 },
    ],
  })

  console.log("  Lesson progress created")

  // ============================================================
  // REVIEWS (course-1)
  // ============================================================

  await prisma.review.createMany({
    data: [
      { id: "rev-1", userId: aditya.id, courseId: course1.id, rating: 5, comment: "Materi paling lengkap yang pernah aku temui untuk Next.js. Penjelasannya sangat terstruktur dan langsung bisa dipraktekan.", createdAt: new Date("2025-03-10T00:00:00Z") },
      { id: "rev-2", userId: maya.id, courseId: course1.id, rating: 5, comment: "Rina menjelaskan konsep yang kompleks dengan sangat simpel. Saya berhasil build SaaS pertama saya setelah selesai kursus ini.", createdAt: new Date("2025-03-05T00:00:00Z") },
      { id: "rev-3", userId: fajar.id, courseId: course1.id, rating: 4, comment: "Sangat bagus! Hanya ada beberapa bagian yang kurang update untuk versi terbaru, tapi overall kursus terbaik.", createdAt: new Date("2025-02-28T00:00:00Z") },
    ],
  })

  console.log("  Reviews created")

  // ============================================================
  // CERTIFICATE (alan, course-3)
  // ============================================================

  await prisma.certificate.create({
    data: {
      id: "cert-1",
      verifyCode: "LRN-2025-CERT-A1B2C3",
      userId: alan.id,
      courseId: course3.id,
      issuedAt: new Date("2025-03-10T00:00:00Z"),
    },
  })

  console.log("  Certificate created")

  // ============================================================
  // NOTIFICATIONS (alan)
  // ============================================================

  await prisma.notification.createMany({
    data: [
      { id: "notif-1", userId: alan.id, type: "CERTIFICATE_ISSUED", title: "Sertifikat Diterbitkan", message: "Selamat! Kamu mendapatkan sertifikat untuk kursus REST API with Laravel 11.", isRead: false, metadata: { courseId: "course-3" }, createdAt: new Date("2025-03-10T09:00:00Z") },
      { id: "notif-2", userId: alan.id, type: "ENROLLMENT", title: "Berhasil Mendaftar", message: "Kamu berhasil mendaftar ke TypeScript Mastery — From Zero to Production.", isRead: false, metadata: { courseId: "course-6" }, createdAt: new Date("2025-03-01T14:30:00Z") },
      { id: "notif-3", userId: alan.id, type: "QUIZ_PASSED", title: "Quiz Lulus!", message: "Kamu lulus Quiz App Router Concepts dengan skor 85.", isRead: true, metadata: { courseId: "course-1" }, createdAt: new Date("2025-02-12T10:00:00Z") },
      { id: "notif-4", userId: alan.id, type: "COURSE_UPDATE", title: "Konten Kursus Diperbarui", message: "Next.js 14 Full Stack SaaS — 3 lesson baru ditambahkan.", isRead: true, metadata: { courseId: "course-1" }, createdAt: new Date("2025-02-10T08:00:00Z") },
    ],
  })

  console.log("  Notifications created")

  console.log("\nSeed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
