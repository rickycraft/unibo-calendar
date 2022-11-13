import { load } from "cheerio"
import { parse } from "csv-parse"
import { createReadStream } from 'fs'
import fetch from 'node-fetch'
import { env } from 'process'

const BASE_URL = "https://dati.unibo.it/dataset/degree-programmes/resource"

const csvUrl = (year: number) => `${BASE_URL}/corsi_${year}_it/download/corsi_${year}_it.csv`

const getCsvYear = async () => {
  const today = new Date()
  const year = today.getFullYear()
  const nextYear = today.getFullYear() + 1
  // first try to do head request
  const head = await fetch(csvUrl(nextYear), { method: "HEAD" })
  if (head.status === 404) {
    // next year is not yet valid
    return year
  }
  if (!head.ok) {
    // unknown error
    console.error("get-csvurl:", head.statusText)
    return undefined
  }
  return nextYear
}

export const getCsv = async () => {
  const year = await getCsvYear()
  if (!year) return undefined
  const csv_url = csvUrl(year)

  let csvStream: NodeJS.ReadableStream
  if (env.NODE_ENV === "development") {
    console.log("csv: using local csv")
    csvStream = createReadStream('/tmp/corsi_2022_it.csv')
  } else {
    console.log("csv:", csv_url)
    const res = await fetch(csv_url)
    if (!res.ok || res.body == null) return undefined
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