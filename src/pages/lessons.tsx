import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { trpc } from '../utils/trpc'

const query_t = z.object({
  code: z.string(),
  year: z.string(),
  curricula: z.string(),
})

const empty = {}

export default function Lessons() {
  const [err, setErr] = useState("")

  const router = useRouter()
  const code = Number(router.query.code ?? "-1")
  const year = Number(router.query.year ?? "-1")
  const curricula = (router.query.curricula ?? "") as string
  const valid = query_t.safeParse(router.query).success

  useEffect(() => {
    if (!router.query["code"]) return
    console.log(router.query)
    // if (!valid) router.push("/")
  }, [router.query])

  const lessons = trpc.course.lessons.useQuery({
    code: code,
    year: year,
    curricula,
  }, {
    enabled: valid,
    onError: (err) => {
      setErr(err.message)
    }
  })
  const subscribe = trpc.calendar.register.useMutation()

  return (
    <div>
      <h1>Lessons</h1>
      <form onChange={(e) => setErr("")} onSubmit={(e) => {
        e.preventDefault()
        if (!lessons.isSuccess) return
        const values = lessons.data.map((lesson) => lesson.code)
        const checked = []
        const form = e.target as HTMLFormElement
        for (const value of values) {
          const input = form.elements.namedItem(value) as HTMLInputElement
          if (input.checked) checked.push(value)
        }
        if (checked.length === 0) {
          setErr("Devi selezionare almeno una lezione")
          return
        }
        subscribe.mutate({
          code,
          year,
          curricula,
          lessons: checked,
        })
      }}>
        {lessons.isSuccess ? lessons.data.map((lesson) => (
          <div key={lesson.code}>
            <input type="checkbox" value={lesson.code} name={lesson.code} />
            <label>{lesson.title}</label>
          </div>
        )) : null}
        <button type='submit'>Conferma</button>
      </form>
      <div>
        <span>{err != "" && err}</span>
      </div>
    </div>
  )
}