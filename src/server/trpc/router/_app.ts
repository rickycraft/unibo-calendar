import { router } from "../trpc"
import { courseRouter } from './course'
import { exampleRouter } from "./example"

export const appRouter = router({
  example: exampleRouter,
  course: courseRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
