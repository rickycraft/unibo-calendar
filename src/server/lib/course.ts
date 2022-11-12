import { load } from "cheerio"
import { parse } from "csv-parse"
import { createReadStream } from 'fs'
import fetch from 'node-fetch'
import { env } from 'process'

const BASE_URL = "https://dati.unibo.it/dataset/degree-programmes/resource"
const getCsvUrl = (year: number) => {
  return `${BASE_URL}/corsi_${year}_it/download/corsi_${year}_it.csv`
}

// TODO: additional parsing
export const getCourseUrl = async (fetch_url: string) => {
  try {
    console.log("course-url:", fetch_url)
    const txt = await (await fetch(fetch_url)).text()
    const $ = load(txt)
    const timetable_url = $("#u-content-preforemost .globe span a").first().attr("href")
    return timetable_url
  } catch (error) {
    console.error("course-error:", error)
    return undefined
  }
}

export const getCsv = async () => {
  // TODO: fix year
  const year = (new Date()).getFullYear()
  const csv_url = getCsvUrl(year)
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
