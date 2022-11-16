import { Event, Lecture, PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { getTimetableAPI } from './timetable'

const DAY = 1000 * 60 * 60 * 24

export async function getCalendar(prisma: PrismaClient, slug: string) {
  const calendar = await prisma.calendar.findFirst({
    where: { slug },
    include: { lecture: true },
  })
  if (!calendar) return undefined

  const today = (new Date()).getTime()
  const cachedLectures = calendar.lecture.filter((l) => (today - l.lastUpdated.getTime()) < DAY)
  const notCachedLectures = calendar.lecture.filter((l) => !cachedLectures.includes(l))

  const cachedEvents = await getLectureCache(prisma, cachedLectures.map((l) => l.code))
  const notCachedEvents = await updateLectureCache(prisma, notCachedLectures)
  return cachedEvents.concat(notCachedEvents)
}

export const updateLectureCache = async (prisma: PrismaClient, lectures: Lecture[]) => {
  const lectureCodes = lectures.map((l) => l.code)
  if (lectures.length === 0 || !lectures[0]) return []
  console.log("cache-miss:", lectureCodes.join(","))
  const course = await prisma.course.findFirst({
    where: { code: lectures[0].courseCode },
    select: { urlTime: true },
  })
  if (!course || !course.urlTime) throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })

  const events = await getTimetableAPI(course.urlTime, lectures[0].year, lectures[0].curricula, lectureCodes)
  if (!events) throw new TRPCError({ code: 'NOT_FOUND', message: 'Events not found' })

  const txDelete = prisma.event.deleteMany({
    where: { lectureCode: { in: lectureCodes } },
  })
  const txCreate = events.map(
    (e) => prisma.event.create({ data: { ...e } })
  )
  const txUpdate = prisma.lecture.updateMany({
    where: { code: { in: lectures.map((l) => l.code) } },
    data: { lastUpdated: new Date() },
  })
  const tx = [txDelete, ...txCreate, txUpdate]
  const res = await prisma.$transaction(tx)
  if (res.length !== tx.length) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Events not cached' })

  return res.splice(1, res.length - 2) as Event[]
}

const getLectureCache = async (prisma: PrismaClient, lectures: string[]) => {
  if (lectures.length > 0) console.log("cache-hit:", lectures.join(","))
  const cachedEvents = await prisma.event.findMany({
    where: {
      lecture: { code: { in: lectures } }
    },
  })
  return cachedEvents
}