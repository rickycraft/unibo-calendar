import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { getCalendar } from '../../lib/calendar'
import { publicProcedure, router } from '../trpc'

export const calendarRouter = router({
  register: publicProcedure
    .input(z.object({
      code: z.number(),
      year: z.number(),
      curricula: z.string(),
      lectures: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const tx = input.lectures.map((lesson) => ctx.prisma.lecture.upsert({
          where: { code: lesson },
          create: {
            code: lesson,
            courses: { connect: { code: input.code } },
            year: input.year,
            curricula: input.curricula,
          },
          update: {
            lastUpdated: new Date(),
          },
          select: { code: true },
        }))
        const res = await ctx.prisma.$transaction(tx)
        console.log(res)
        const calendar = await ctx.prisma.calendar.create({
          data: {
            lecture: { connect: res.map((r) => ({ code: r.code })) },
          },
        })
        return calendar
      } catch (error) {
        return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: String(error) })
      }
    }),
  get: publicProcedure
    .input(z.object({
      slug: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const calendar = await getCalendar(ctx.prisma, input.slug)
      return calendar
    }),
  list: publicProcedure
    .query(async ({ ctx }) => {
      const calendars = await ctx.prisma.calendar.findMany({
        include: { lecture: true },
      })
      return calendars
    }),
})