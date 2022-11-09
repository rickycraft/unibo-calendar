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
      <span>year: {calendar.data?.year}</span>
      <span>curricula: {calendar.data?.curricula}</span>
      {calendar.data?.lessons.map((lesson) => (
        <span key={lesson.id}>Lezioni: {lesson.code}</span>
      ))}
    </ContainerFH>
  )
}
