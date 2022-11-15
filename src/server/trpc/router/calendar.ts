import { TRPCError } from '@trpc/server'
import { updateLectureCache } from 'server/lib/calendar'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

const DEFAULT_DATE = new Date(2021, 0, 1)

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
            lastUpdated: DEFAULT_DATE,
          },
          update: {},
          select: { code: true },
        }))
        const res = await ctx.prisma.$transaction(tx)
        const calendar = await ctx.prisma.calendar.create({
          data: {
            lecture: { connect: res.map((r) => ({ code: r.code })) },
          },
        })
        return calendar
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: String(error) })
      }
    }),
  get: publicProcedure
    .input(z.object({
      slug: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const calendar = await ctx.prisma.calendar.findUnique({
        where: { slug: input.slug },
      })
      if (!calendar) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Calendar not found' })
      }
      return calendar
    }),
  list: publicProcedure
    .input(z.object({
      page: z.number(),
      pageSize: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const calendars = await ctx.prisma.calendar.findMany({
        select: {
          slug: true,
          lecture: {
            select: {
              code: true,
              lastUpdated: true,
              courses: {
                select: {
                  description: true,
                },
              }
            }
          }
        },
        orderBy: {
          slug: 'asc',
        },
        skip: input.page * input.pageSize,
        take: input.pageSize,
      })
      return calendars
    }),
  count: publicProcedure
    .query(async ({ ctx }) => {
      const count = await ctx.prisma.calendar.count()
      return count
    }),
  refresh: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const calendar = await ctx.prisma.calendar.findFirst({
        where: { slug: input.slug },
        include: { lecture: true },
      })
      if (calendar == null) throw new TRPCError({ code: 'NOT_FOUND', message: 'Calendar not found' })
      const res = await updateLectureCache(ctx.prisma, calendar.lecture)
      return res.length
    }),
})