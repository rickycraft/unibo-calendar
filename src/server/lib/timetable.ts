import fetch from "node-fetch"
import { env } from 'process'
import { z } from 'zod'

const DELTA_DAY = 120

const event_t = z.object({
  title: z.string(),
  start: z.string(),
  end: z.string(),
  extCode: z.string(),
  aule: z.array(
    z.object({
      des_piano: z.string(),
      des_edificio: z.string(),
    }
    )).optional(),
})
const events_t = z.array(event_t)

export const getTimetable = async (baseUrl: string, year: number, curricula: string, days: number = DELTA_DAY) => {
  const start = new Date()
  const end = new Date()
  if (env.NODE_ENV === "development") {
    end.setDate(start.getDate() + 7)
  } else {
    end.setDate(start.getDate() + days)
  }
  const url = getTimetableUrl(baseUrl, year, curricula, start, end)
  console.log("getTimetable", url)
  const res = await fetch(url)
  if (!res.ok) return undefined
  const json = await res.json()
  const state = events_t.safeParse(json)
  if (!state.success) return undefined
  return state.data
}

export const getFilterTimetable = async (timetable: z.infer<typeof events_t>, lessonCode: string[]) => {
  return timetable.filter((event) => lessonCode.includes(event.extCode))
}

export const getLessons = async (timetable: z.infer<typeof events_t>) => {
  const lessons: { title: string, code: string }[] = []
  const codes: string[] = []
  timetable.forEach(event => {
    if (codes.indexOf(event.extCode) == -1) {
      lessons.push({ title: event.title, code: event.extCode })
      codes.push(event.extCode)
    }
  })
  return lessons
}

const getTimetableUrl = (baseUrl: string, year: number, curricula: string, start: Date, end: Date) => {
  return `${baseUrl}/orario-lezioni/@@orario_reale_json?anno=${year}&curricula=${curricula}&start=${start.toISOString().substring(0, 10)}&end=${end.toISOString().substring(0, 10)}`
}
