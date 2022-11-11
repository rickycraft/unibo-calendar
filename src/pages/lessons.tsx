import { Button, Checkbox, Notification } from '@mantine/core'
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

export default function Lessons() {
  const [err, setErr] = useState("")
  const setError = (err: string) => {
    setErr(err)
    setTimeout(() => setErr(""), 5000)
  }
  const resetError = () => setErr("")

  const router = useRouter()
  const code = Number(router.query.code ?? "-1")
  const year = Number(router.query.year ?? "-1")
  const curricula = (router.query.curricula ?? "") as string
  const valid = query_t.safeParse(router.query).success

  useEffect(() => {
    if (!router.query["code"]) return
    if (!valid) router.push("/")
  }, [router.query])

  const lessons = trpc.course.lessons.useQuery({
    code: code,
    year: year,
    curricula,
  }, {
    enabled: valid,
    onError: (err) => {
      setError(err.message)
    }
  })
  const subscribe = trpc.calendar.register.useMutation({
    onSuccess: (data) => {
      router.push(`/calendar/${data.slug}`)
    },
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      setError("Devi selezionare almeno una lezione")
      return
    }
    subscribe.mutate({
      code,
      year,
      curricula,
      lectures: checked,
    })
  }

  return (
    <>
      <ContainerFH>
        <form onChange={resetError} onSubmit={onSubmit}>
          <div>
            <h1 className='text-center'>Scegli le lezioni</h1>
            <div className='space-y-3 w-fit mx-auto'>
              {lessons.isSuccess ? lessons.data.map((lesson) => (
                <Checkbox name={lesson.code} key={lesson.code} label={(
                  <>{lesson.title.split("/")[0]}<br />{lesson.title.split("/")[1]}</>
                )} />
              )) : null}
              <div className='flex justify-center'>
                <Button type='submit' className='mt-3 w-3/4'>Conferma</Button>
              </div>
            </div>
          </div>
        </form>
      </ContainerFH>
      <Notification className='fixed bottom-16 inset-x-0 w-1/2 mx-auto'
        color="red" hidden={err == ""} onClick={resetError}>
        {err}
      </Notification>
    </>
  )
}