import { Button } from '@mantine/core'
import ContainerFH from '../components/ContainerFH'
import { trpc } from '../utils/trpc'

export default function Admin() {

  const updateCsv = trpc.course.update.useMutation()

  return (
    <ContainerFH>
      <h1>Admin</h1>
      <div>
        <Button color="orange"
          loading={updateCsv.isLoading}
          onClick={() => updateCsv.mutate()}
        >
          Refresh csv
        </Button>
      </div>
    </ContainerFH>
  )
}