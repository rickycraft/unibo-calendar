import { DateTime } from "luxon"
import fetch from "node-fetch"
import { env } from 'process'
import { z } from 'zod'

const DELTA_DAY = 120

const event_t = z.object({
  title: z.string(),
  start: z.string(),
  end: z.string(),
  extCode: z.string(),
  aule: z.array(z.object({
    des_piano: z.string(),
    des_edificio: z.string(),
  })),
})
const events_t = z.array(event_t)
type timetable = {
  title: string,
  start: Date,
  end: Date,
  lectureCode: string,
  aula: string,
}[]

export const getTimetableAPI = async (baseUrl: string, year: number, curricula: string, insegnamenti: string[] = []) => {
  const start = DateTime.now()
  const end = start.plus({ days: (env.NODE_ENV === "development") ? 7 : DELTA_DAY })

  const url = getTimetableUrl(baseUrl, year, curricula, start.toJSDate(), end.toJSDate(), insegnamenti)
  console.log("timetable-url:", url.substring(baseUrl.length))
  const res = await fetch(url)
  if (!res.ok) return undefined
  const json = await res.json()
  const state = events_t.safeParse(json)
  if (!state.success) return undefined
  return state.data.map((e) => {
    const start = DateTime.fromISO(e.start, { zone: "Europe/Rome" })
    const end = DateTime.fromISO(e.end, { zone: "Europe/Rome" })
    const aula = (e.aule.length > 0) ? e.aule[0]?.des_edificio + " - " + e.aule[0]?.des_piano : ""
    return {
      title: e.title,
      start: start.toJSDate(),
      end: end.toJSDate(),
      lectureCode: e.extCode,
      aula,
    }
  })
}

export const getLessons = async (timetable: timetable) => {
  const lessons: { title: string, code: string }[] = []
  const codes: string[] = []
  timetable.forEach(event => {
    if (codes.indexOf(event.lectureCode) == -1) {
      lessons.push({ title: event.title, code: event.lectureCode })
      codes.push(event.lectureCode)
    }
  })
  lessons.sort((a, b) => a.title.localeCompare(b.title))
  return lessons
}

const getTimetableUrl = (baseUrl: string, year: number, curricula: string, _start: Date, _end: Date, insegnamenti: string[]) => {

  const ins = insegnamenti.map(i => `&insegnamenti=${i}`).join("")
  const start = _start.toISOString().substring(0, 10)
  const end = _end.toISOString().substring(0, 10)
  const url = `${baseUrl}/@@orario_reale_json?anno=${year}&curricula=${curricula}&start=${start}&end=${end}${ins}`
  return url
}
