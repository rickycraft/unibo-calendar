import { Accordion, Button, List, Notification, Pagination } from '@mantine/core'
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

export default function Admin(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const pageCount = useMemo(() => Math.ceil(props.count / PAGE_SIZE), [props.count])
  const [page, setPage] = useState(1)

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
  }, {
    keepPreviousData: true,
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
          <Accordion>
            {calendars.data?.map((calendar) => (
              <Accordion.Item value={calendar.slug} key={calendar.slug}>
                <Accordion.Control><a href={`/calendar/${calendar.slug}`}>{calendar.slug}</a></Accordion.Control>
                <Accordion.Panel>
                  <span>{calendar.lecture[0]?.courses.description}</span>
                  <List>
                    {calendar.lecture.map((lecture) => (
                      <List.Item key={lecture.code}>{lecture.code} @ {lecture.lastUpdated.toLocaleDateString()}</List.Item>
                    ))}
                  </List>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
          <Pagination total={pageCount} siblings={0} page={page} onChange={setPage} className="justify-center mt-5" />
        </div>
      </ContainerFH>
      <Notification className='fixed bottom-16 inset-x-0 w-1/2 mx-auto' disallowClose
        color={(msg.includes("error")) ? "red" : "blue"} hidden={msg == ""}>
        {msg}
      </Notification>
    </>
  )
}

