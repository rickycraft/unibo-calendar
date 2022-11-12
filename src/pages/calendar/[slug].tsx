import { Card } from '@mantine/core'
import ContainerFH from 'components/ContainerFH'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { trpc } from 'utils/trpc'

const SITE_HOST = 'calendar.rroveri.com'
const IMG_SIZE = 120
const S3_URL = "https://unibo-calendar.s3.eu-south-1.amazonaws.com"

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
        <ImgContainer onClick={openGoogle} title='Aggiungi a Google' src={S3_URL + '/google.png'} alt='google' />
        <ImgContainer onClick={openApple} title='Aggiungi a Apple' src={S3_URL + '/apple.png'} alt='apple' />
      </div>
    </ContainerFH>
  )
}

const ImgContainer = (
  { onClick, title, src, alt }:
    { onClick: () => void, title: string, src: string, alt: string }
) => {
  return (
    <Card radius="lg"
      className='text-center cursor-pointer flex flex-col aspect-square lg:w-2/5 w-52 mt-7 lg:mt-0'
      onClick={onClick}
    >
      <h3>{title}</h3>
      <div className='flex justify-center flex-grow'>
        <Image src={src} alt={alt} height={IMG_SIZE} width={IMG_SIZE} className="my-auto" />
      </div>
    </Card>
  )
}
