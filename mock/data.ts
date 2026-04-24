// ============================================================
// Learnify — Mock Data
// Replace with real API calls / server actions in Phase 3
// ============================================================

import type {
  Profile,
  Category,
  Course,
  CourseDetail,
  Enrollment,
  LessonProgress,
  Review,
  Certificate,
  Notification,
  InstructorStats,
  CoursePerformance,
  StudentStats,
  ActivityItem,
  InstructorSummary,
  Testimonial,
  RecentEnrollment,
  Lesson,
  Quiz,
} from "@/type"

// ============================================================
// CATEGORIES
// ============================================================

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Web Development", slug: "web-development", description: "Frontend & backend web development", iconUrl: null },
  { id: "cat-2", name: "UI/UX Design", slug: "ui-ux-design", description: "User interface and experience design", iconUrl: null },
  { id: "cat-3", name: "Data Science", slug: "data-science", description: "Data analysis, ML, and AI", iconUrl: null },
  { id: "cat-4", name: "Mobile Development", slug: "mobile-development", description: "iOS and Android development", iconUrl: null },
  { id: "cat-5", name: "DevOps", slug: "devops", description: "CI/CD, containerization, and cloud", iconUrl: null },
]

// ============================================================
// INSTRUCTORS
// ============================================================

export const MOCK_INSTRUCTORS: InstructorSummary[] = [
  {
    id: "inst-1",
    fullName: "Rina Maharani",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=rina",
    headline: "Senior Full Stack Developer & Educator",
    courseCount: 4,
    studentCount: 3240,
    rating: 4.9,
    bio: "Rina has 8 years of experience building scalable web applications. She's worked with startups and enterprises across SEA and loves sharing knowledge through structured, project-based courses.",
  },
  {
    id: "inst-2",
    fullName: "Budi Santoso",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=budi",
    headline: "UI/UX Designer & Design Systems Specialist",
    courseCount: 3,
    studentCount: 1870,
    rating: 4.7,
    bio: "Budi has designed products used by millions. He specializes in design systems, component-driven design, and bridging the gap between designers and developers.",
  },
  {
    id: "inst-3",
    fullName: "Sari Dewi",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=sari",
    headline: "Data Engineer & Machine Learning Practitioner",
    courseCount: 2,
    studentCount: 980,
    rating: 4.8,
    bio: "Sari works as a data engineer at a leading fintech company. She's passionate about making data engineering accessible to developers transitioning into data roles.",
  },
  {
    id: "inst-4",
    fullName: "Rizky Firmansyah",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=rizky",
    headline: "DevOps Engineer & Cloud Architect",
    courseCount: 2,
    studentCount: 1120,
    rating: 4.6,
    bio: "Rizky has set up CI/CD pipelines and cloud infrastructure for dozens of companies. He focuses on practical, real-world DevOps workflows.",
  },
]

// ============================================================
// COURSES
// ============================================================

export const MOCK_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Next.js 14 — Build Full Stack SaaS Applications",
    slug: "nextjs-14-fullstack-saas",
    description: "Master Next.js 14 App Router by building a production-grade SaaS application from scratch. Covers server components, server actions, authentication, Prisma ORM, Stripe payments, and deployment.",
    shortDesc: "Build a production SaaS app with Next.js 14, Prisma, and Stripe.",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    trailerUrl: null,
    price: 349000,
    isFree: false,
    status: "PUBLISHED",
    level: "INTERMEDIATE",
    language: "id",
    totalDuration: 68400,          // ~19 hours
    totalLessons: 52,
    instructorId: "inst-1",
    instructor: MOCK_INSTRUCTORS[0],
    categoryId: "cat-1",
    category: MOCK_CATEGORIES[0],
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
      "Write clean, maintainable TypeScript code",
    ],
    rating: 4.9,
    reviewCount: 312,
    enrollmentCount: 1840,
    createdAt: "2025-01-10T00:00:00Z",
    publishedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: "course-2",
    title: "Figma to Code — Design Systems for Developers",
    slug: "figma-to-code-design-systems",
    description: "Learn how to translate Figma designs into pixel-perfect React components. Build a complete design system with Tailwind CSS and shadcn/ui while mastering component architecture and design tokens.",
    shortDesc: "Translate Figma designs into a production-ready component library.",
    thumbnailUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
    trailerUrl: null,
    price: 299000,
    isFree: false,
    status: "PUBLISHED",
    level: "INTERMEDIATE",
    language: "id",
    totalDuration: 43200,          // ~12 hours
    totalLessons: 38,
    instructorId: "inst-2",
    instructor: MOCK_INSTRUCTORS[1],
    categoryId: "cat-2",
    category: MOCK_CATEGORIES[1],
    requirements: [
      "Basic HTML & CSS",
      "Familiar with React components",
      "No Figma experience required",
    ],
    outcomes: [
      "Read and interpret Figma design files",
      "Build a scalable component library",
      "Implement design tokens with Tailwind CSS",
      "Create consistent UI with shadcn/ui",
      "Document components with Storybook",
    ],
    rating: 4.7,
    reviewCount: 187,
    enrollmentCount: 920,
    createdAt: "2025-02-01T00:00:00Z",
    publishedAt: "2025-02-05T00:00:00Z",
  },
  {
    id: "course-3",
    title: "REST API with Laravel 11 & PostgreSQL",
    slug: "rest-api-laravel-11-postgresql",
    description: "Build robust, scalable REST APIs using Laravel 11. Covers authentication with Sanctum, resource controllers, API versioning, request validation, rate limiting, and testing with PHPUnit.",
    shortDesc: "Build scalable REST APIs with Laravel 11 and PostgreSQL.",
    thumbnailUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
    trailerUrl: null,
    price: 0,
    isFree: true,
    status: "PUBLISHED",
    level: "BEGINNER",
    language: "id",
    totalDuration: 32400,          // ~9 hours
    totalLessons: 29,
    instructorId: "inst-1",
    instructor: MOCK_INSTRUCTORS[0],
    categoryId: "cat-1",
    category: MOCK_CATEGORIES[0],
    requirements: [
      "Basic PHP knowledge",
      "Understand what an API is",
    ],
    outcomes: [
      "Build RESTful APIs with Laravel 11",
      "Implement token-based auth with Sanctum",
      "Write database migrations and seeders",
      "Test APIs with Postman and PHPUnit",
      "Handle errors and validation properly",
    ],
    rating: 4.8,
    reviewCount: 543,
    enrollmentCount: 3210,
    createdAt: "2024-11-01T00:00:00Z",
    publishedAt: "2024-11-05T00:00:00Z",
  },
  {
    id: "course-4",
    title: "Data Engineering with Python & dbt",
    slug: "data-engineering-python-dbt",
    description: "Learn modern data engineering practices using Python, Apache Airflow, dbt, and BigQuery. Build end-to-end data pipelines and analytics infrastructure from scratch.",
    shortDesc: "Build production data pipelines with Python, Airflow, and dbt.",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    trailerUrl: null,
    price: 449000,
    isFree: false,
    status: "PUBLISHED",
    level: "ADVANCED",
    language: "id",
    totalDuration: 79200,          // ~22 hours
    totalLessons: 61,
    instructorId: "inst-3",
    instructor: MOCK_INSTRUCTORS[2],
    categoryId: "cat-3",
    category: MOCK_CATEGORIES[2],
    requirements: [
      "Python fundamentals (functions, loops, files)",
      "Basic SQL knowledge",
      "Comfortable with command line",
    ],
    outcomes: [
      "Build batch and streaming data pipelines",
      "Orchestrate workflows with Apache Airflow",
      "Transform data with dbt",
      "Load data into BigQuery and Snowflake",
      "Implement data quality checks",
      "Monitor pipeline health",
    ],
    rating: 4.8,
    reviewCount: 98,
    enrollmentCount: 540,
    createdAt: "2025-03-01T00:00:00Z",
    publishedAt: "2025-03-10T00:00:00Z",
  },
  {
    id: "course-5",
    title: "Docker & Kubernetes for Web Developers",
    slug: "docker-kubernetes-web-developers",
    description: "Containerize your web applications and deploy them to Kubernetes. Covers Docker fundamentals, Docker Compose, Kubernetes concepts, Helm charts, and deploying to a managed cluster.",
    shortDesc: "Containerize and deploy web apps with Docker and Kubernetes.",
    thumbnailUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
    trailerUrl: null,
    price: 399000,
    isFree: false,
    status: "PUBLISHED",
    level: "INTERMEDIATE",
    language: "id",
    totalDuration: 54000,          // ~15 hours
    totalLessons: 44,
    instructorId: "inst-4",
    instructor: MOCK_INSTRUCTORS[3],
    categoryId: "cat-5",
    category: MOCK_CATEGORIES[4],
    requirements: [
      "Basic Linux command line",
      "Deployed at least one web app to a VPS or cloud provider",
    ],
    outcomes: [
      "Write production-ready Dockerfiles",
      "Orchestrate multi-container apps with Compose",
      "Understand Kubernetes core concepts",
      "Deploy apps to a Kubernetes cluster",
      "Set up CI/CD with GitHub Actions",
    ],
    rating: 4.6,
    reviewCount: 134,
    enrollmentCount: 670,
    createdAt: "2025-01-20T00:00:00Z",
    publishedAt: "2025-01-25T00:00:00Z",
  },
  {
    id: "course-6",
    title: "TypeScript Mastery — From Zero to Production",
    slug: "typescript-mastery-zero-to-production",
    description: "Master TypeScript from the ground up. Covers type system fundamentals, generics, utility types, decorators, and real-world patterns used in production Node.js and React codebases.",
    shortDesc: "Master TypeScript with real-world patterns for React and Node.js.",
    thumbnailUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
    trailerUrl: null,
    price: 279000,
    isFree: false,
    status: "PUBLISHED",
    level: "BEGINNER",
    language: "id",
    totalDuration: 36000,          // ~10 hours
    totalLessons: 33,
    instructorId: "inst-1",
    instructor: MOCK_INSTRUCTORS[0],
    categoryId: "cat-1",
    category: MOCK_CATEGORIES[0],
    requirements: [
      "JavaScript fundamentals",
      "Basic understanding of functions and objects",
    ],
    outcomes: [
      "Understand the TypeScript type system",
      "Write type-safe React components",
      "Use generics and utility types",
      "Configure tsconfig for different environments",
      "Apply TypeScript in real projects",
    ],
    rating: 4.9,
    reviewCount: 421,
    enrollmentCount: 2340,
    createdAt: "2024-10-15T00:00:00Z",
    publishedAt: "2024-10-20T00:00:00Z",
  },
  {
    id: "course-7",
    title: "React Native — Build Cross-Platform Mobile Apps",
    slug: "react-native-cross-platform",
    description: "Build iOS and Android apps with React Native and Expo. Covers navigation, state management, native APIs, push notifications, and deploying to the App Store and Google Play.",
    shortDesc: "Build iOS & Android apps with React Native and Expo.",
    thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    trailerUrl: null,
    price: 349000,
    isFree: false,
    status: "PUBLISHED",
    level: "INTERMEDIATE",
    language: "id",
    totalDuration: 57600,          // ~16 hours
    totalLessons: 48,
    instructorId: "inst-2",
    instructor: MOCK_INSTRUCTORS[1],
    categoryId: "cat-4",
    category: MOCK_CATEGORIES[3],
    requirements: [
      "React fundamentals (hooks, components)",
      "Basic JavaScript/TypeScript",
    ],
    outcomes: [
      "Build cross-platform mobile apps",
      "Implement navigation with Expo Router",
      "Manage state with Zustand",
      "Access native device features",
      "Publish to App Store and Google Play",
    ],
    rating: 4.7,
    reviewCount: 156,
    enrollmentCount: 780,
    createdAt: "2025-02-15T00:00:00Z",
    publishedAt: "2025-02-20T00:00:00Z",
  },
  {
    id: "course-8",
    title: "UX Research — Methods & Practical Application",
    slug: "ux-research-methods-practical",
    description: "Learn how to conduct effective UX research. Covers user interviews, usability testing, surveys, competitive analysis, affinity mapping, and communicating findings to stakeholders.",
    shortDesc: "Master UX research methods and translate findings into design decisions.",
    thumbnailUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80",
    trailerUrl: null,
    price: 0,
    isFree: true,
    status: "PUBLISHED",
    level: "BEGINNER",
    language: "id",
    totalDuration: 25200,          // ~7 hours
    totalLessons: 24,
    instructorId: "inst-2",
    instructor: MOCK_INSTRUCTORS[1],
    categoryId: "cat-2",
    category: MOCK_CATEGORIES[1],
    requirements: [
      "No prior UX experience needed",
      "Willingness to conduct interviews and gather user feedback",
    ],
    outcomes: [
      "Plan and conduct user interviews",
      "Run moderated usability tests",
      "Synthesize research with affinity mapping",
      "Create research reports for stakeholders",
      "Prioritize features based on user evidence",
    ],
    rating: 4.8,
    reviewCount: 289,
    enrollmentCount: 1920,
    createdAt: "2024-12-01T00:00:00Z",
    publishedAt: "2024-12-05T00:00:00Z",
  },
]

// ============================================================
// COURSE DETAIL (chapters + lessons for course-1)
// ============================================================

export const MOCK_COURSE_DETAIL: CourseDetail = {
  ...MOCK_COURSES[0],
  chapters: [
    {
      id: "ch-1",
      title: "Getting Started",
      description: "Project overview and environment setup",
      position: 1,
      isFree: true,
      lessons: [
        { id: "les-1", title: "What we're building", type: "VIDEO", position: 1, isFree: true, duration: 480, videoUrl: null, videoPlaybackId: null, content: null, description: "Overview of the final project", chapterId: "ch-1" },
        { id: "les-2", title: "Project setup & folder structure", type: "VIDEO", position: 2, isFree: true, duration: 720, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-1" },
        { id: "les-3", title: "Configuring Tailwind & shadcn/ui", type: "VIDEO", position: 3, isFree: false, duration: 600, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-1" },
      ],
    },
    {
      id: "ch-2",
      title: "App Router Deep Dive",
      description: "Server components, layouts, and routing patterns",
      position: 2,
      isFree: false,
      lessons: [
        { id: "les-4", title: "Server vs Client components", type: "VIDEO", position: 1, isFree: false, duration: 900, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-2" },
        { id: "les-5", title: "Nested layouts & route groups", type: "VIDEO", position: 2, isFree: false, duration: 840, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-2" },
        { id: "les-6", title: "Loading UI & Suspense", type: "VIDEO", position: 3, isFree: false, duration: 660, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-2" },
        { id: "les-7", title: "Error boundaries", type: "VIDEO", position: 4, isFree: false, duration: 540, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-2" },
        { id: "les-8", title: "Quiz — App Router Concepts", type: "QUIZ", position: 5, isFree: false, duration: null, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-2" },
      ],
    },
    {
      id: "ch-3",
      title: "Authentication with Supabase",
      description: "Auth flow, sessions, and protected routes",
      position: 3,
      isFree: false,
      lessons: [
        { id: "les-9", title: "Supabase project setup", type: "VIDEO", position: 1, isFree: false, duration: 780, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-3" },
        { id: "les-10", title: "Email & password sign up", type: "VIDEO", position: 2, isFree: false, duration: 900, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-3" },
        { id: "les-11", title: "Session management with cookies", type: "VIDEO", position: 3, isFree: false, duration: 720, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-3" },
        { id: "les-12", title: "Middleware & protected routes", type: "VIDEO", position: 4, isFree: false, duration: 840, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-3" },
      ],
    },
    {
      id: "ch-4",
      title: "Database with Prisma + Supabase",
      description: "Schema design, migrations, and queries",
      position: 4,
      isFree: false,
      lessons: [
        { id: "les-13", title: "Prisma schema design", type: "VIDEO", position: 1, isFree: false, duration: 1080, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-4" },
        { id: "les-14", title: "Migrations & seed data", type: "VIDEO", position: 2, isFree: false, duration: 720, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-4" },
        { id: "les-15", title: "Prisma schema reference", type: "ATTACHMENT", position: 3, isFree: false, duration: null, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-4" },
      ],
    },
    {
      id: "ch-5",
      title: "Stripe Payments",
      description: "Subscription billing and webhook handling",
      position: 5,
      isFree: false,
      lessons: [
        { id: "les-16", title: "Stripe Checkout integration", type: "VIDEO", position: 1, isFree: false, duration: 960, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-5" },
        { id: "les-17", title: "Webhook handling", type: "VIDEO", position: 2, isFree: false, duration: 900, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-5" },
        { id: "les-18", title: "Subscription management", type: "VIDEO", position: 3, isFree: false, duration: 840, videoUrl: null, videoPlaybackId: null, content: null, description: null, chapterId: "ch-5" },
      ],
    },
  ],
  reviews: [
    { id: "rev-1", rating: 5, comment: "Materi paling lengkap yang pernah aku temui untuk Next.js. Penjelasannya sangat terstruktur dan langsung bisa dipraktekan.", createdAt: "2025-03-10T00:00:00Z", student: { id: "stu-1", fullName: "Aditya Pratama", avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=aditya" } },
    { id: "rev-2", rating: 5, comment: "Rina menjelaskan konsep yang kompleks dengan sangat simpel. Saya berhasil build SaaS pertama saya setelah selesai kursus ini.", createdAt: "2025-03-05T00:00:00Z", student: { id: "stu-2", fullName: "Maya Indira", avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=maya" } },
    { id: "rev-3", rating: 4, comment: "Sangat bagus! Hanya ada beberapa bagian yang kurang update untuk versi terbaru, tapi overall kursus terbaik.", createdAt: "2025-02-28T00:00:00Z", student: { id: "stu-3", fullName: "Fajar Nugroho", avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=fajar" } },
  ],
  attachments: [
    { id: "att-1", name: "Prisma Schema Starter.prisma", url: "#", size: 4200, mimeType: "text/plain" },
    { id: "att-2", name: "Project Boilerplate.zip", url: "#", size: 2048000, mimeType: "application/zip" },
    { id: "att-3", name: "Deployment Checklist.pdf", url: "#", size: 180000, mimeType: "application/pdf" },
  ],
}

// ============================================================
// CURRENT USER (logged-in student)
// ============================================================

export const MOCK_CURRENT_USER: Profile = {
  id: "user-1",
  email: "alan@example.com",
  fullName: "Alan Ari Mahendra",
  avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=alan",
  bio: "Full stack developer passionate about building SaaS products.",
  headline: "Full Stack Developer",
  website: "https://pramadhanindi.my.id",
  role: "STUDENT",
  isActive: true,
  createdAt: "2025-01-01T00:00:00Z",
}

// ============================================================
// ENROLLMENTS (current user)
// ============================================================

export const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: "enr-1",
    enrolledAt: "2025-02-01T00:00:00Z",
    completedAt: null,
    progressPercent: 62,
    courseId: "course-1",
    course: MOCK_COURSES[0],
    studentId: "user-1",
  },
  {
    id: "enr-2",
    enrolledAt: "2025-01-20T00:00:00Z",
    completedAt: "2025-03-10T00:00:00Z",
    progressPercent: 100,
    courseId: "course-3",
    course: MOCK_COURSES[2],
    studentId: "user-1",
  },
  {
    id: "enr-3",
    enrolledAt: "2025-03-01T00:00:00Z",
    completedAt: null,
    progressPercent: 28,
    courseId: "course-6",
    course: MOCK_COURSES[5],
    studentId: "user-1",
  },
]

// ============================================================
// LESSON PROGRESS (current user, course-1)
// ============================================================

export const MOCK_LESSON_PROGRESS: LessonProgress[] = [
  { id: "lp-1", isCompleted: true, completedAt: "2025-02-02T00:00:00Z", watchedSeconds: 480, lessonId: "les-1", studentId: "user-1" },
  { id: "lp-2", isCompleted: true, completedAt: "2025-02-02T00:00:00Z", watchedSeconds: 720, lessonId: "les-2", studentId: "user-1" },
  { id: "lp-3", isCompleted: true, completedAt: "2025-02-03T00:00:00Z", watchedSeconds: 600, lessonId: "les-3", studentId: "user-1" },
  { id: "lp-4", isCompleted: true, completedAt: "2025-02-05T00:00:00Z", watchedSeconds: 900, lessonId: "les-4", studentId: "user-1" },
  { id: "lp-5", isCompleted: false, completedAt: null, watchedSeconds: 320, lessonId: "les-5", studentId: "user-1" },
]

// ============================================================
// STUDENT STATS
// ============================================================

export const MOCK_STUDENT_STATS: StudentStats = {
  coursesEnrolled: 3,
  lessonsCompleted: 34,
  certificatesEarned: 1,
  currentStreak: 7,
}

// ============================================================
// CERTIFICATES
// ============================================================

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: "cert-1",
    verifyCode: "LRN-2025-CERT-A1B2C3",
    issuedAt: "2025-03-10T00:00:00Z",
    studentId: "user-1",
    student: { id: "user-1", fullName: "Alan Ari Mahendra", avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=alan" },
    courseId: "course-3",
    course: { id: "course-3", title: "REST API with Laravel 11 & PostgreSQL", slug: "rest-api-laravel-11-postgresql", thumbnailUrl: MOCK_COURSES[2].thumbnailUrl },
    instructor: { id: "inst-1", fullName: "Rina Maharani" },
  },
]

// ============================================================
// NOTIFICATIONS
// ============================================================

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "notif-1", type: "CERTIFICATE_ISSUED", title: "Sertifikat Diterbitkan", message: "Selamat! Kamu mendapatkan sertifikat untuk kursus REST API with Laravel 11.", isRead: false, metadata: { courseId: "course-3" }, createdAt: "2025-03-10T09:00:00Z" },
  { id: "notif-2", type: "ENROLLMENT", title: "Berhasil Mendaftar", message: "Kamu berhasil mendaftar ke TypeScript Mastery — From Zero to Production.", isRead: false, metadata: { courseId: "course-6" }, createdAt: "2025-03-01T14:30:00Z" },
  { id: "notif-3", type: "QUIZ_PASSED", title: "Quiz Lulus!", message: "Kamu lulus Quiz App Router Concepts dengan skor 85.", isRead: true, metadata: { courseId: "course-1" }, createdAt: "2025-02-12T10:00:00Z" },
  { id: "notif-4", type: "COURSE_UPDATE", title: "Konten Kursus Diperbarui", message: "Next.js 14 Full Stack SaaS — 3 lesson baru ditambahkan.", isRead: true, metadata: { courseId: "course-1" }, createdAt: "2025-02-10T08:00:00Z" },
]

// ============================================================
// ACTIVITY FEED
// ============================================================

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "act-1", type: "CERTIFICATE_EARNED", message: "Mendapat sertifikat untuk REST API with Laravel 11 & PostgreSQL", createdAt: "2025-03-10T09:00:00Z", metadata: { courseTitle: "REST API with Laravel 11 & PostgreSQL" } },
  { id: "act-2", type: "LESSON_COMPLETED", message: "Menyelesaikan pelajaran Session management with cookies", createdAt: "2025-03-08T20:30:00Z", metadata: { lessonTitle: "Session management with cookies", courseTitle: "Next.js 14 Full Stack SaaS" } },
  { id: "act-3", type: "QUIZ_PASSED", message: "Lulus Quiz App Router Concepts dengan skor 85%", createdAt: "2025-02-12T10:00:00Z", metadata: { courseTitle: "Next.js 14 Full Stack SaaS", score: 85 } },
  { id: "act-4", type: "ENROLLED", message: "Mendaftar ke TypeScript Mastery — From Zero to Production", createdAt: "2025-03-01T14:30:00Z", metadata: { courseTitle: "TypeScript Mastery — From Zero to Production" } },
  { id: "act-5", type: "LESSON_COMPLETED", message: "Menyelesaikan pelajaran Middleware & protected routes", createdAt: "2025-02-10T19:00:00Z", metadata: { lessonTitle: "Middleware & protected routes", courseTitle: "Next.js 14 Full Stack SaaS" } },
]

// ============================================================
// INSTRUCTOR STATS (for Rina — inst-1)
// ============================================================

export const MOCK_INSTRUCTOR_STATS: InstructorStats = {
  totalRevenue: 14280000,
  totalRevenueChange: 12.4,
  totalStudents: 842,
  totalStudentsChange: 34,
  activeCourses: 3,
  avgRating: 4.87,
  monthlyRevenue: [
    { month: "Nov", revenue: 6200000 },
    { month: "Dec", revenue: 7800000 },
    { month: "Jan", revenue: 9400000 },
    { month: "Feb", revenue: 11200000 },
    { month: "Mar", revenue: 13100000 },
    { month: "Apr", revenue: 14280000 },
  ],
}

export const MOCK_COURSE_PERFORMANCE: CoursePerformance[] = [
  { courseId: "course-1", title: "Next.js 14 — Build Full Stack SaaS", thumbnailUrl: MOCK_COURSES[0].thumbnailUrl, studentCount: 1840, rating: 4.9, revenue: 9820000, status: "PUBLISHED" },
  { courseId: "course-3", title: "REST API with Laravel 11 & PostgreSQL", thumbnailUrl: MOCK_COURSES[2].thumbnailUrl, studentCount: 3210, rating: 4.8, revenue: 0, status: "PUBLISHED" },
  { courseId: "course-6", title: "TypeScript Mastery — From Zero to Production", thumbnailUrl: MOCK_COURSES[5].thumbnailUrl, studentCount: 2340, rating: 4.9, revenue: 4460000, status: "PUBLISHED" },
  { courseId: "course-draft-1", title: "Next.js + Supabase Auth Deep Dive", thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80", studentCount: 0, rating: 0, revenue: 0, status: "DRAFT" },
]

// ============================================================
// TESTIMONIALS (landing page)
// ============================================================

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "testi-1",
    quote: "Setelah mengikuti kursus Next.js dari Learnify, saya berhasil mendapat pekerjaan pertama sebagai fullstack developer dalam 3 bulan. Materinya sangat terstruktur dan langsung bisa dipraktekan.",
    authorName: "Dimas Ariyanto",
    authorRole: "Junior Fullstack Developer",
    authorCompany: "Tokopedia",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=dimas",
  },
  {
    id: "testi-2",
    quote: "Platform belajar terbaik untuk developer Indonesia. Kursus design system-nya mengubah cara saya bekerja — sekarang tim saya punya component library yang konsisten dan scalable.",
    authorName: "Putri Wulandari",
    authorRole: "UI Engineer",
    authorCompany: "Gojek",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=putri",
  },
  {
    id: "testi-3",
    quote: "Kursus data engineering di Learnify paling praktis yang pernah saya ikuti. Langsung build pipeline dari nol sampai deploy. Sekarang saya handle data pipeline di perusahaan dengan percaya diri.",
    authorName: "Hendra Wijaya",
    authorRole: "Data Engineer",
    authorCompany: "Bukalapak",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=hendra",
  },
]

// ============================================================
// RECENT ENROLLMENTS (instructor dashboard)
// ============================================================

export const MOCK_RECENT_ENROLLMENTS: RecentEnrollment[] = [
  {
    id: "renr-1",
    studentName: "Andi Saputra",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=andi",
    courseTitle: "Next.js 14 — Build Full Stack SaaS Applications",
    enrolledAt: "2025-04-20T14:30:00Z",
    amount: 349000,
  },
  {
    id: "renr-2",
    studentName: "Lestari Handayani",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=lestari",
    courseTitle: "TypeScript Mastery — From Zero to Production",
    enrolledAt: "2025-04-19T09:15:00Z",
    amount: 279000,
  },
  {
    id: "renr-3",
    studentName: "Bayu Setiawan",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=bayu",
    courseTitle: "Next.js 14 — Build Full Stack SaaS Applications",
    enrolledAt: "2025-04-18T20:45:00Z",
    amount: 349000,
  },
  {
    id: "renr-4",
    studentName: "Nadia Kusuma",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=nadia",
    courseTitle: "REST API with Laravel 11 & PostgreSQL",
    enrolledAt: "2025-04-17T11:00:00Z",
    amount: 0,
  },
  {
    id: "renr-5",
    studentName: "Teguh Prasetyo",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=teguh",
    courseTitle: "TypeScript Mastery — From Zero to Production",
    enrolledAt: "2025-04-16T16:20:00Z",
    amount: 279000,
  },
]

// ============================================================
// CURRENT LESSON (video player page)
// ============================================================

export const MOCK_CURRENT_LESSON: Lesson = {
  id: "les-5",
  title: "Nested layouts & route groups",
  description: "Learn how Next.js App Router handles nested layouts and route groups. We'll build a real-world layout structure with marketing pages, dashboard, and authenticated routes — each with their own layout wrappers.",
  type: "VIDEO",
  position: 2,
  isFree: false,
  duration: 840,
  videoUrl: null,
  videoPlaybackId: null,
  content: "In this lesson, you'll learn:\n\n1. How layouts nest automatically in the App Router\n2. Route groups with parentheses — (marketing), (dashboard), (player)\n3. Shared layouts vs. per-route layouts\n4. When to use layout.tsx vs. template.tsx\n5. Practical example: building Learnify's layout structure",
  chapterId: "ch-2",
}

// ============================================================
// QUIZ (course player quiz tab)
// ============================================================

export const MOCK_QUIZ: Quiz = {
  id: "quiz-1",
  title: "Quiz — App Router Concepts",
  passingScore: 75,
  allowRetake: true,
  maxAttempts: 3,
  timeLimit: 600,
  questions: [
    {
      id: "q-1",
      text: "Apa perbedaan utama antara Server Component dan Client Component di Next.js?",
      explanation: "Server Components dirender di server dan tidak mengirim JavaScript ke browser. Client Components dirender di browser dan membutuhkan 'use client' directive.",
      position: 1,
      points: 25,
      options: [
        { id: "q1-a", text: "Server Component dirender di server, Client Component dirender di browser", isCorrect: true, position: 1 },
        { id: "q1-b", text: "Server Component lebih cepat karena menggunakan cache", isCorrect: false, position: 2 },
        { id: "q1-c", text: "Client Component tidak bisa mengakses database", isCorrect: false, position: 3 },
        { id: "q1-d", text: "Tidak ada perbedaan, hanya penamaan berbeda", isCorrect: false, position: 4 },
      ],
    },
    {
      id: "q-2",
      text: "Bagaimana cara membuat route group di App Router?",
      explanation: "Route group dibuat dengan membungkus nama folder dalam tanda kurung, misalnya (marketing). Folder ini tidak mempengaruhi URL path.",
      position: 2,
      points: 25,
      options: [
        { id: "q2-a", text: "Menggunakan underscore: _marketing/page.tsx", isCorrect: false, position: 1 },
        { id: "q2-b", text: "Menggunakan tanda kurung: (marketing)/page.tsx", isCorrect: true, position: 2 },
        { id: "q2-c", text: "Menggunakan bracket: [marketing]/page.tsx", isCorrect: false, position: 3 },
        { id: "q2-d", text: "Menggunakan config di next.config.ts", isCorrect: false, position: 4 },
      ],
    },
    {
      id: "q-3",
      text: "Apa fungsi file loading.tsx dalam App Router?",
      explanation: "loading.tsx menampilkan UI loading otomatis menggunakan React Suspense saat konten halaman sedang dimuat.",
      position: 3,
      points: 25,
      options: [
        { id: "q3-a", text: "Menampilkan animasi loading saat aplikasi pertama kali dibuka", isCorrect: false, position: 1 },
        { id: "q3-b", text: "Menampilkan skeleton UI otomatis via Suspense saat halaman dimuat", isCorrect: true, position: 2 },
        { id: "q3-c", text: "Mengatur timeout untuk API request", isCorrect: false, position: 3 },
        { id: "q3-d", text: "Menampilkan progress bar di atas halaman", isCorrect: false, position: 4 },
      ],
    },
    {
      id: "q-4",
      text: "Kapan sebaiknya menggunakan 'use client' directive?",
      explanation: "Gunakan 'use client' hanya ketika component membutuhkan interaktivitas browser seperti useState, useEffect, onClick, atau browser API lainnya.",
      position: 4,
      points: 25,
      options: [
        { id: "q4-a", text: "Di setiap component agar bisa menggunakan hooks", isCorrect: false, position: 1 },
        { id: "q4-b", text: "Hanya di layout.tsx", isCorrect: false, position: 2 },
        { id: "q4-c", text: "Ketika component butuh interaktivitas: state, effects, atau event handlers", isCorrect: true, position: 3 },
        { id: "q4-d", text: "Ketika component mengambil data dari database", isCorrect: false, position: 4 },
      ],
    },
  ],
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Format seconds to "Xh Ym" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** Format IDR price */
export function formatPrice(price: number): string {
  if (price === 0) return "Gratis"
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price)
}

/** Format number with K/M abbreviation */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/** Format relative time ("2 hours ago") */
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} menit yang lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam yang lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari yang lalu`
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}