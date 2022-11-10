import { List } from '@mantine/core'
import { useRouter } from 'next/router'
import ContainerFH from '../../components/ContainerFH'
import { trpc } from '../../utils/trpc'

export default function Calendar() {
  const router = useRouter()
  const _slug = router.query.slug
  const slug = (typeof _slug !== 'string') ? "" : _slug

  const calendar = trpc.calendar.get.useQuery({ slug: slug ?? "" }, {
    retry: 1,
    enabled: slug != "",
  })

  if (slug == "" || calendar.isLoading) {
    return <ContainerFH>Loading...</ContainerFH>
  }
  if (calendar.data == null && calendar.isSuccess) {
    router.push('/404')
  }
  return (
    <ContainerFH>
      <h2>SLUG: {slug}</h2>
      <List>
        {calendar.data?.map((e, idx) => (
          <List.Item key={idx}>{e.lectureCode} | {e.start.toISOString().substring(0, 16)} - {e.end.toISOString().substring(0, 16)} | {e.aula}</List.Item>
        ))}
      </List>
    </ContainerFH>
  )
}
