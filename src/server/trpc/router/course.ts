import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { getCsv, getTimetableUrl } from '../../lib/course'
import { publicProcedure, router } from "../trpc"

export const courseRouter = router({
  update: publicProcedure
    .mutation(async ({ ctx }) => {
      try {
        const records = await getCsv()
        if (records == undefined) throw new Error("records is undefined")

        const transactions = records.map((record) => ctx.prisma.course.upsert({
          where: {
            code_year:
            {
              code: record.code,
              year: record.year
            }
          },
          create: record,
          update: {},
        }))
        const res = await ctx.prisma.$transaction(transactions)
        return res.length
      } catch (error) {
        return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: String(error) })
      }

    }),
  timeUrl: publicProcedure
    .input(z.object({ code: z.number() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findFirst({
        where: { code: input.code },
      })
      if (course == null) return new TRPCError({ code: 'NOT_FOUND', message: 'course not found' })

      const timetable_url = await getTimetableUrl(course.url)
      if (timetable_url == undefined) return new TRPCError({ code: 'NOT_FOUND', message: 'timetable not found' })
      return timetable_url
    }),
  get: publicProcedure
    .input(z.object({ code: z.number() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findFirst({
        where: { code: input.code },
      })
      if (course == null) return new TRPCError({ code: 'NOT_FOUND', message: 'course not found' })
      return course
    }),
})

