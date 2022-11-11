import { MantineProvider } from '@mantine/core'
import { useColorScheme } from '@mantine/hooks'
import { type AppType } from "next/app"
import Head from 'next/head'
import "../styles/globals.css"
import { trpc } from "../utils/trpc"

const MyApp: AppType = ({ Component, pageProps }) => {
  const preferredColorScheme = useColorScheme('dark')

  return (
    <>
      <Head>
        <title>unibo-calendar</title>
        <meta name="description" content="Applicazione per aggiungere al calendario le lezioni di unibo" />
        <link rel="icon" href="/favicon.ico" />
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
