import { prisma } from "@/lib/db"

/** Get all users for admin management */
export async function getAllUsers() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

/** Get all courses for admin review */
export async function getAllCoursesAdmin() {
  return prisma.course.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      status: true,
      level: true,
      price: true,
      enrollmentCount: true,
      createdAt: true,
      instructor: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
