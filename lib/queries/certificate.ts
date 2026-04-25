import { prisma } from "@/lib/db"
import { serializeCertificate } from "@/lib/serializers"
import type { Certificate } from "@/type"

/** Get certificate by verification code — public page */
export async function getCertificateByCode(verifyCode: string): Promise<Certificate | null> {
  const row = await prisma.certificate.findUnique({
    where: { verifyCode },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          instructor: { select: { id: true, name: true } },
        },
      },
    },
  })
  if (!row) return null
  return serializeCertificate(row)
}
