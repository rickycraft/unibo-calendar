import { Button, List } from '@mantine/core'
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
        <List>
          {calendars.data?.map((calendar) => (
            <List.Item key={calendar.slug}>
              <span>{calendar.slug}</span>
              <List>
                {calendar.lessons.map((lesson) => (
                  <List.Item key={lesson.id}>
                    <span>{lesson.code}</span>
                  </List.Item>))}
              </List>
            </List.Item>
          ))}
        </List>
      </div>
    </ContainerFH>
  )
}