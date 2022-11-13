import { S3_URL } from 'consts'
import { type AppType } from "next/app"
import Head from 'next/head'
import { trpc } from "../utils/trpc"
// style
import { MantineProvider } from '@mantine/core'
import { useColorScheme } from '@mantine/hooks'
import "../styles/globals.css"
// analytics
import { GoogleAnalytics } from 'nextjs-google-analytics'

const MyApp: AppType = ({ Component, pageProps }) => {
  const preferredColorScheme = useColorScheme('dark')

  return (
    <>
      <GoogleAnalytics trackPageViews strategy="lazyOnload" />
      <Head>
        <title>unibo-calendar</title>
        <meta name="description" content="Applicazione per aggiungere al calendario le lezioni di unibo" />
        <link rel="shortcut icon" href={S3_URL + "/calendar.png"} type="image/x-icon" />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: preferredColorScheme }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  )
}

export default trpc.withTRPC(MyApp)
