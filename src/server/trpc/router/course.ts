import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { getCourseUrl, getCsv } from '../../lib/course'
import { getcurriculas } from '../../lib/curricula'
import { getLessons, getTimetable } from '../../lib/timetable'
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
  get: publicProcedure
    .input(z.object({ code: z.number() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.course.findFirst({
        where: { code: input.code },
      })
      if (course == null) return new TRPCError({ code: 'NOT_FOUND', message: 'course not found' })
      return course
    }),
  schools: publicProcedure
    .query(async ({ ctx }) => {
      const schools = await ctx.prisma.course.findMany({
        select: { school: true },
        distinct: ["school"],
      })
      return schools.map((s) => s.school).sort()
    }),
  types: publicProcedure
    .input(z.object({ school: z.string() }))
    .query(async ({ ctx, input }) => {
      const types = await ctx.prisma.course.findMany({
        select: { type: true },
        where: { school: input.school },
        distinct: ["type"],
      })
      return types.map((s) => s.type).sort()
    }),
  courses: publicProcedure
    .input(z.object({ school: z.string(), type: z.string() }))
    .query(async ({ ctx, input }) => {
      const courses = await ctx.prisma.course.findMany({
        where: { school: input.school, type: input.type },
        select: { code: true, description: true, duration: true },
        orderBy: { description: "asc" },
      })
      return courses
    }),
  curricula: publicProcedure
    .input(z.object({ code: z.number() }))
    .query(async ({ input, ctx }) => {
      const course = await ctx.prisma.course.findFirst({
        where: { code: input.code },
      })
      if (course == null) throw new TRPCError({ code: 'NOT_FOUND', message: 'course not found' })
      const course_url = await getCourseUrl(course.url)
      if (course_url == undefined) throw new TRPCError({ code: 'NOT_FOUND', message: 'timetable not found' })
      const curriculas = await getcurriculas(course_url)
      if (curriculas == undefined) throw new TRPCError({ code: 'NOT_FOUND', message: 'curriculas not found' })
      await ctx.prisma.course.update({
        where: { code: input.code },
        data: { urlTime: course_url },
      })
      return curriculas
    }),
  lessons: publicProcedure
    .input(z.object({
      code: z.number(),
      year: z.number(),
      curricula: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const course = await ctx.prisma.course.findFirst({
        where: { code: input.code },
      })
      if (course == null || course.urlTime == null) throw new TRPCError({ code: 'NOT_FOUND', message: 'course not found' })
      const timetalbe = await getTimetable(course.urlTime, input.year, input.curricula)
      if (timetalbe == undefined) throw new TRPCError({ code: 'NOT_FOUND', message: 'timetable not found' })
      const lessons = await getLessons(timetalbe)

      return lessons
    }),
})

