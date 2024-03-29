import { Accordion, Button, Input, List, Notification, Pagination } from '@mantine/core'
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { useMemo, useState } from 'react'
import { createSSG } from 'server/trpc/router/_app'
import ContainerFH from '../components/ContainerFH'
import { trpc } from '../utils/trpc'

const PAGE_SIZE = 5

const unauth = {
  redirect: {
    destination: '/',
    permanent: false,
  },
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  if (process.env.NODE_ENV !== 'development') {
    const trueToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN
    if (!trueToken) return unauth
    const { token } = context.query
    if (token !== trueToken) return unauth
  }

  const ssg = await createSSG()
  const count = await ssg.calendar.count.fetch()

  return {
    props: {
      count,
    },
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Admin(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const pageCount = useMemo(() => Math.ceil(props.count / PAGE_SIZE), [props.count])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [msg, _setMsg] = useState("")
  const setMsg = (msg: string) => {
    _setMsg(msg)
    setTimeout(() => _setMsg(""), 5000)
  }

  const updateCsv = trpc.course.update.useMutation({
    onError(error) {
      setMsg("error " + error.message)
    },
    onSuccess(data) {
      setMsg("parsed " + data + " courses")
    },
  })
  const calendars = trpc.calendar.list.useQuery({
    page: page - 1,
    pageSize: PAGE_SIZE,
    slug: search,
  }, {
    keepPreviousData: true,
  })
  const updateCalendar = trpc.calendar.refresh.useMutation({
    onError(error) {
      setMsg("error " + error.message)
    },
    onSuccess(data, { slug }) {
      setMsg(`updated ${slug} with ${data} events`)
      calendars.refetch()
    },
  })

  return (
    <>
      <ContainerFH>
        <div className='mt-3 w-fit mx-auto'>
          <h2>Actions</h2>
          <Button color="orange"
            loading={updateCsv.isLoading}
            onClick={() => updateCsv.mutate()}
          >
            Refresh csv
          </Button>
        </div>
        <div className='mt-3 w-fit mx-auto'>
          <h2 className='text-center'>Calendars</h2>
          <Input placeholder='Search' value={search} onChange={(e: any) => setSearch(e.currentTarget.value)} />
          <Accordion>
            {calendars.data?.map((calendar) => (
              <Accordion.Item value={calendar.slug} key={calendar.slug}>
                <Accordion.Control><a href={`/calendar/${calendar.slug}`}>{calendar.slug}</a></Accordion.Control>
                <Accordion.Panel>
                  <span>{calendar.lecture[0]?.courses.type} - {calendar.lecture[0]?.courses.description}</span>
                  <span onClick={() => updateCalendar.mutate({ slug: calendar.slug })} className="cursor-pointer"> 🔄</span>
                  <List>
                    {calendar.lecture.map((lecture) => (
                      <List.Item key={lecture.code}>{lecture.code} @ {lecture.lastUpdated.toLocaleDateString("it-IT")}</List.Item>
                    ))}
                  </List>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
          {search == "" && <Pagination total={pageCount} siblings={0} page={page} onChange={setPage} className="justify-center mt-5" />}
        </div>
      </ContainerFH>
      <Notification className='status-message' disallowClose
        color={(msg.includes("error")) ? "red" : "blue"} hidden={msg == ""}>
        {msg}
      </Notification>
    </>
  )
}

