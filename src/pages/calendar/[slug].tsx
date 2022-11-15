import { Card } from '@mantine/core'
import ContainerFH from 'components/ContainerFH'
import { S3_URL, SITE_HOST } from 'consts'
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { trpc } from 'utils/trpc'

const IMG_SIZE = 120

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { slug } = context.query
  const valid = (typeof slug == 'string')

  if (!valid) return { notFound: true }
  return { props: { slug } }
}

export default function Calendar(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const router = useRouter()
  const slug = props.slug
  const calendar = trpc.calendar.get.useQuery({ slug }, {
    retry: 1,
    onError(err) {
      err.data?.code === 'NOT_FOUND' && router.push('/404')
      console.error("calendar-front:", err.message)
    },
  })

  const webcalUrl = `webcal://${SITE_HOST}/api/calendar/${slug}`
  const googleUrl = `https://calendar.google.com/calendar/u/0/r?cid=${webcalUrl}`
  const appleUrl = webcalUrl

  const openUrl = (url: string) => {
    if (!calendar.isSuccess) return
    window.open(url, '_blank')
  }
  const openApple = () => openUrl(appleUrl)
  const openGoogle = () => openUrl(googleUrl)

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
