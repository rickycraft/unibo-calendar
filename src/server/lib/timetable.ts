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
  extCode: string,
  aula: string,
}[]

export const getTimetable = async (baseUrl: string, year: number, curricula: string, lang: string = 'italiano') => {
  const start = new Date()
  const end = new Date()
  if (env.NODE_ENV === "development") end.setDate(start.getDate() + 7)
  else end.setDate(start.getDate() + DELTA_DAY)

  const url = getTimetableUrl(baseUrl, year, curricula, start, end, lang, [])
  console.log("getTimetable", url)
  const res = await fetch(url)
  if (!res.ok) return undefined
  const json = await res.json()
  const state = events_t.safeParse(json)
  if (!state.success) return undefined
  return state.data.map((e) => {
    const start = new Date(e.start)
    const end = new Date(e.end)
    const aula = (e.aule.length > 0) ? e.aule[0]?.des_edificio + " - " + e.aule[0]?.des_piano : ""
    return {
      title: e.title,
      start,
      end,
      extCode: e.extCode,
      aula,
    }
  })
}

export const getLessons = async (timetable: timetable) => {
  const lessons: { title: string, code: string }[] = []
  const codes: string[] = []
  timetable.forEach(event => {
    if (codes.indexOf(event.extCode) == -1) {
      lessons.push({ title: event.title, code: event.extCode })
      codes.push(event.extCode)
    }
  })
  lessons.sort((a, b) => a.title.localeCompare(b.title))
  return lessons
}

const getTimetableUrl = (baseUrl: string, year: number, curricula: string, _start: Date, _end: Date, lang: string, insegnamenti: string[]) => {
  const t = (lang == "italiano") ? "orario-lezioni" : "timetable"
  const ins = insegnamenti.map(i => `&insegnamenti=${i}`).join()
  const start = _start.toISOString().substring(0, 10)
  const end = _end.toISOString().substring(0, 10)
  const url = `${baseUrl}/${t}/@@orario_reale_json?anno=${year}&curricula=${curricula}&start=${start}&end=${end}${ins}`
  console.log("timetableUrl", url)
  return url
}
