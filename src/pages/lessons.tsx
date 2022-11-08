import { Button, Checkbox } from '@mantine/core'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import ContainerFH from '../components/ContainerFH'
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
    <ContainerFH>
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
        console.log(checked)
        // subscribe.mutate({
        //   code,
        //   year,
        //   curricula,
        //   lessons: checked,
        // })
      }}>
        <div className='space-y-3'>
          {lessons.isSuccess ? lessons.data.map((lesson) => (
            <Checkbox name={lesson.code} label={lesson.title} key={lesson.code} />
          )) : null}
        </div>
        <Button type='submit' className='mt-3 w-9/12 mx-auto'>Conferma</Button>
      </form>
      <div>
        <span>{err != "" && err}</span>
      </div>
    </ContainerFH>
  )
}