import Image from "next/image"

interface AvatarProps {
  src?: string | null
  name: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: { container: "w-8 h-8", text: "text-xs", px: 32 },
  md: { container: "w-10 h-10", text: "text-sm", px: 40 },
  lg: { container: "w-14 h-14", text: "text-base", px: 56 },
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const s = sizeMap[size]

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={s.px}
        height={s.px}
        className={`${s.container} rounded-full object-cover shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${s.container} rounded-full bg-primary-container flex items-center justify-center shrink-0`}
    >
      <span className={`${s.text} font-bold text-on-primary-container`}>
        {getInitials(name)}
      </span>
    </div>
  )
}

export default Avatar
