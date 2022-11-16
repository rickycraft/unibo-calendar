import type { PrismaClient } from '@prisma/client'
import { currentYear } from 'consts'

// Check if moving to next year
export const handleNextYear = async (prisma: PrismaClient) => {
  const year = currentYear()
  const dbYear = await prisma.course.groupBy({
    by: ['year'],
  })
  const years = dbYear.map((y) => y.year)
  if (years.includes(year)) {
    // year already in db
    return
  }
  // is next year
  console.log('year: moving to next year')
  const deleteEvents = prisma.event.deleteMany({})
  const deleteCalendar = prisma.calendar.deleteMany({})
  const deleteLecture = prisma.lecture.deleteMany({})
  const res = await prisma.$transaction([deleteEvents, deleteCalendar, deleteLecture])
  console.log(`Deleted ${res[0].count} events, ${res[1].count} calendars, ${res[2].count} lectures`)
}