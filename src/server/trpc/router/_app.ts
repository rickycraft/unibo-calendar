import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import { createContextInner } from 'server/trpc/context'
import superjson from 'superjson'
import { router } from "../trpc"
import { calendarRouter } from './calendar'
import { courseRouter } from './course'

export const appRouter = router({
  course: courseRouter,
  calendar: calendarRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter


export const createSSG = async () => createProxySSGHelpers({
  router: appRouter,
  ctx: await createContextInner({}),
  transformer: superjson, // optional - adds superjson serialization
})