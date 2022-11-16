import { Course, PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { load } from "cheerio"
import { currentYear } from 'consts'
import { parse } from "csv-parse"
import { createReadStream } from 'fs'
import fetch from 'node-fetch'
import { env } from 'process'

const BASE_URL = "https://dati.unibo.it/dataset/degree-programmes/resource"

const csvUrl = (year: number) => `${BASE_URL}/corsi_${year}_it/download/corsi_${year}_it.csv`

export const getCsv = async () => {
  const year = currentYear()
  const csv_url = csvUrl(year)

  let csvStream: NodeJS.ReadableStream
  if (env.NODE_ENV === "development") {
    console.log("csv: using local csv")
    csvStream = createReadStream('/tmp/corsi_2022_it.csv')
  } else {
    console.log("csv:", csv_url)
    const res = await fetch(csv_url)
    if (!res.ok || res.body == null) {
      console.error("csv-error:", res.statusText)
      return undefined
    }
    csvStream = res.body
  }
  const records = []
  const parser = parse({
    delimiter: ",",
    from_line: 2,
  })
  csvStream.pipe(parser)
  for await (const _record of parser) {
    //TODO: zod safe parsing
    const record = _record as string[]
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [
      _year, _imm,
      code,
      description,
      url,
      _campus, _sede,
      school,
      type,
      duration,
      _int, _int_tit, _int_lang,
      language,
      _access
    ] = record
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    records.push({
      year,
      code: Number(code),
      description: description!,
      url: url!,
      type: type!,
      duration: Number(duration),
      school: school!,
      language: language!,
    })
  }
  return records
}

export const getCourseUrl = async (fetch_url: string) => {
  console.log("course-url:", fetch_url)
  const res = await fetch(fetch_url)
  if (!res.ok) {
    console.error("course-error:", res.statusText)
    return undefined
  }
  const txt = await res.text()
  const $ = load(txt)
  const timetable_url = $("#u-content-preforemost .globe span a").first().attr("href")
  return timetable_url
}

export const getCourseTimeUrl = async (prisma: PrismaClient, course: Course) => {
  if (course.urlTime != null) return course.urlTime

  const _course_url = await getCourseUrl(course.url)
  if (_course_url == null) throw new TRPCError({ code: 'NOT_FOUND', message: 'course url not found' })

  const lang = (course.language == "italiano") ? "orario-lezioni" : "timetable"
  const course_url = `${_course_url}/${lang}`
  await prisma.course.update({
    where: { code: course.code },
    data: { urlTime: course_url },
  })

  return course_url
}