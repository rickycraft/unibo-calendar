import { Card } from '@mantine/core'
import ContainerFH from 'components/ContainerFH'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { trpc } from 'utils/trpc'

const SITE_HOST = 'calendar.rroveri.com'

export default function Calendar() {
  const router = useRouter()
  const _slug = router.query.slug
  const slug = (typeof _slug !== 'string') ? "" : _slug

  const calendar = trpc.calendar.get.useQuery({ slug: slug ?? "" }, {
    enabled: slug != "",
    onError: () => {
      router.push('/404')
    },
  })

  const webcalUrl = `webcal://${SITE_HOST}/api/calendar/${slug}`
  const googleUrl = `https://calendar.google.com/calendar/u/0/r?cid=${webcalUrl}`
  const appleUrl = webcalUrl

  const openApple = () => window.open(appleUrl, '_blank')
  const openGoogle = () => window.open(googleUrl, '_blank')

  if (slug == "" || calendar.isLoading) {
    return <ContainerFH>Loading...</ContainerFH>
  }

  return (
    <ContainerFH>
      <h2 className='text-center'>OTTIENI IL TUO CALENDARIO</h2>
      <div className='flex flex-wrap justify-around'>
        <Card radius="lg"
          className='text-center cursor-pointer lg:w-1/3 w-52'
          onClick={openGoogle}
        >
          <h3>Aggiungi a Google</h3>
          <Image src="/google.png" alt='google' height={100} width={100} />
        </Card>
        <Card radius="lg"
          className='text-center cursor-pointer lg:w-1/3 w-52 mt-7 lg:mt-0'
          onClick={openApple}
        >
          <h3>Aggiungi a Apple</h3>
          <Image src="/apple.png" alt='apple' height={100} width={100} />
        </Card>
      </div>
    </ContainerFH>
  )
}
