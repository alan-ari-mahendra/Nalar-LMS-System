export type LessonType = "VIDEO" | "TEXT" | "QUIZ" | "ATTACHMENT"

export interface BuilderQuestionOption {
  text: string
  isCorrect: boolean
}

export interface BuilderQuestion {
  id: string
  text: string
  explanation: string | null
  position: number
  points: number
  options: { id: string; text: string; isCorrect: boolean; position: number }[]
}

export interface BuilderQuiz {
  id: string
  title: string
  passingScore: number
  allowRetake: boolean
  questions: BuilderQuestion[]
}

export interface BuilderLesson {
  id: string
  title: string
  description: string | null
  type: LessonType
  position: number
  duration: number | null
  videoUrl: string | null
  content: string | null
  quiz: BuilderQuiz | null
}

export interface BuilderChapter {
  id: string
  title: string
  description: string | null
  position: number
  lessons: BuilderLesson[]
}

export interface BuilderCourse {
  id: string
  title: string
  description: string
  shortDesc: string
  price: number
  level: string
  status: string
  categoryId: string
  thumbnailUrl: string
  chapters: BuilderChapter[]
}
