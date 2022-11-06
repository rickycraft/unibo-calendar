import fetch from "node-fetch"
import { z } from 'zod'

const DELTA_DAY = 7

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

export const getTimetable = async (baseUrl: string, year: number, curricola: string) => {
  const start = new Date()
  const end = new Date()
  end.setDate(start.getDate() + DELTA_DAY)
  const url = getTimetableUrl(baseUrl, year, curricola, start, end)
  const res = await fetch(url)
  if (!res.ok) return undefined
  const json = await res.json()
  const state = events_t.safeParse(json)
  if (!state.success) return undefined
  return state.data
}

export const getLessons = async (baseUrl: string, year: number, curricola: string) => {
  const timetable = await getTimetable(baseUrl, year, curricola)
  if (timetable == undefined) return undefined
  const lessons: { title: string, code: string }[] = []
  const codes: string[] = []
  timetable.forEach(event => {
    if (codes.indexOf(event.extCode) == -1) {
      lessons.push({ title: event.title, code: event.extCode })
      codes.push(event.extCode)
    }
  })
  console.log(lessons)
  console.log(codes)
  return lessons
}

const getTimetableUrl = (baseUrl: string, year: number, curricola: string, start: Date, end: Date) => {
  return `${baseUrl}/orario-lezioni/@@orario_reale_json?anno=${year}&curricola=${curricola}&start=${start.toISOString().substring(0, 10)}&end=${end.toISOString().substring(0, 10)}`
}
