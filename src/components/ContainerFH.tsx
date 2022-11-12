import { Anchor, Footer, Group } from '@mantine/core'
import { useColorScheme } from '@mantine/hooks'
import { useMemo } from 'react'

export default function ContainerFH({ children }: { children: React.ReactNode }) {
  const preferredColorScheme = useColorScheme('dark')
  const footerColor = useMemo(() => (preferredColorScheme === 'dark' ? "#141517" : "#FAFAFA"), [preferredColorScheme])

  return (
    <div className='h-screen'>
      <div className='lg:w-1/2 w-4/5 mx-auto flex flex-col justify-center' style={{ height: "95vh", overflowY: "auto" }}>
        {children}
      </div>
      <Footer height="5vh" className='flex flex-col justify-center' style={{ backgroundColor: footerColor }}>
        <Group position='center' className='text-sm my-auto'>
          <Anchor href="https://github.com/rickycraft/unibo-calendar/issues" variant='text' className='hover:underline'>
            SEGNALA UN PROBLEMA
          </Anchor>
        </Group>
      </Footer>
    </div>
  )
}