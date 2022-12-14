import type { DateArray, EventAttributes } from 'ics'
import { createEvents } from 'ics'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../server/db/client'
import { getCalendar } from '../../../server/lib/calendar'

const utcTuple = (date: Date): DateArray => {
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes()]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  if (typeof slug !== 'string') {
    res.status(404).json({ error: 'Invalid slug' })
    return
  }
  console.log("calendar-ics:", slug)
  const calendar = await getCalendar(prisma, slug)
  if (!calendar) {
    console.error("calendar-error:", slug, "not found")
    res.status(404).json({ error: 'Calendar not found' })
    return
  }
  const events: EventAttributes[] = calendar.map((e) => ({
    title: e.title,
    start: utcTuple(e.start),
    startInputType: 'utc',
    end: utcTuple(e.end),
    endInputType: 'utc',
    location: e.aula,
  }))
  const { error, value } = createEvents(events)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.setHeader('Content-Type', 'text/calendar')
  res.status(200).send(value)
}
