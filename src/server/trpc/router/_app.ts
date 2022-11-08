import { router } from "../trpc"
import { calendarRouter } from './calendar'
import { courseRouter } from './course'

export const appRouter = router({
  course: courseRouter,
  calendar: calendarRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
