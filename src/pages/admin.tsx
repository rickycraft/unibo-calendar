import { Accordion, Button, List } from '@mantine/core'
import ContainerFH from '../components/ContainerFH'
import { trpc } from '../utils/trpc'

export default function Admin() {

  const updateCsv = trpc.course.update.useMutation()
  const calendars = trpc.calendar.list.useQuery()

  return (
    <ContainerFH>

      <div className='mt-3 w-fit mx-auto'>
        <h1>Admin</h1>
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
                <List>
                  {calendar.lecture.map((lecture) => (
                    <List.Item key={lecture.code}>{lecture.code} @ {lecture.lastUpdated.toLocaleDateString()}</List.Item>
                  ))}
                </List>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </ContainerFH>
  )
}