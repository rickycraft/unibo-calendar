import { Accordion, Button, List, Pagination } from '@mantine/core'
import { type InferGetServerSidePropsType } from 'next'
import { useMemo, useState } from 'react'
import { createSSG } from 'server/trpc/router/_app'
import ContainerFH from '../components/ContainerFH'
import { trpc } from '../utils/trpc'

const PAGE_SIZE = 5

export const getServerSideProps = async () => {

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

  const updateCsv = trpc.course.update.useMutation()
  const calendars = trpc.calendar.list.useQuery({
    page: page - 1,
    pageSize: PAGE_SIZE,
  })

  return (
    <ContainerFH>
      <div className='mt-3 w-fit mx-auto'>
        <h1>Actions</h1>
        <Button color="orange"
          loading={updateCsv.isLoading}
          onClick={() => updateCsv.mutate()}
        >
          Refresh csv
        </Button>
      </div>
      <div className='mt-3 w-fit mx-auto'>
        <h1 className='text-center'>Calendars</h1>
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
        <Pagination total={pageCount} page={page} onChange={setPage} className="justify-center mt-5" />
      </div>
    </ContainerFH>
  )
}