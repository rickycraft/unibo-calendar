import { TRPCError } from '@trpc/server'
import { getCourseTimeUrl, getCsv } from 'server/lib/course'
import { getCurriculas } from 'server/lib/curricula'
import { getLessons, getTimetableAPI } from 'server/lib/timetable'
import { publicProcedure, router } from "server/trpc/trpc"
import { z } from 'zod'

export const courseRouter = router({
  update: publicProcedure
    .mutation(async ({ ctx }) => {
      const records = await getCsv()
      if (records == undefined) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "cannot fetch csv" })

      const transactions = records.map((record) => ctx.prisma.course.upsert({
        where: { code: record.code },
        create: record,
        update: record,
      }))
      const res = await ctx.prisma.$transaction(transactions)
      return res.length
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

      const course_url = await getCourseTimeUrl(ctx.prisma, course)
      const curriculas = await getCurriculas(course_url)
      if (curriculas == undefined) throw new TRPCError({ code: 'NOT_FOUND', message: 'curriculas not found' })
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
      const timetable = await getTimetableAPI(course.urlTime, input.year, input.curricula)
      if (timetable == undefined) throw new TRPCError({ code: 'NOT_FOUND', message: 'timetable not found' })
      const lessons = await getLessons(timetable)
      return lessons
    }),
})

