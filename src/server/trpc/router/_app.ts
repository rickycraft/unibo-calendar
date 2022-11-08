import { router } from "../trpc"
import { calendarRouter } from './calendar'
import { courseRouter } from './course'
import { exampleRouter } from "./example"

export const appRouter = router({
  example: exampleRouter,
  course: courseRouter,
  calendar: calendarRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
