import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const calendarRouter = router({
  register: publicProcedure
    .input(z.object({
      code: z.number(),
      year: z.number(),
      curricula: z.string(),
      lessons: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const tx = input.lessons.map((lesson) => ctx.prisma.lesson.upsert({
          where: { code: lesson },
          create: {
            code: lesson,
            course: { connect: { code: input.code } },
          },
          update: {},
          select: { id: true },
        }))
        const res = await ctx.prisma.$transaction(tx)
        const calendar = await ctx.prisma.calendar.create({
          data: {
            year: input.year,
            curricula: input.curricula,
            lessons: { connect: res.map((r) => ({ id: r.id })) },
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
      const calendar = await ctx.prisma.calendar.findFirst({
        where: { slug: input.slug },
        include: { lessons: true },
      })
      return calendar
    }),
  list: publicProcedure
    .query(async ({ ctx }) => {
      const calendars = await ctx.prisma.calendar.findMany({
        include: { lessons: true },
      })
      return calendars
    }),
})