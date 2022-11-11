import { Anchor, Footer, Group } from '@mantine/core'

export default function ContainerFH({ children }: { children: React.ReactNode }) {
  return (
    <div className='h-screen'>
      <div className='lg:w-1/2 w-4/5 mx-auto flex flex-col justify-center' style={{ height: "95vh" }}>
        {children}
      </div>
      <Footer height="5vh" className='flex flex-col justify-center'>
        <Group position='center' className='text-sm my-auto'>
          <Anchor href="https://github.com/rickycraft/unibo-calendar/issues" variant='text'>
            SEGNALA UN PROBLEMA
          </Anchor>
        </Group>
      </Footer>
    </div>
  )
}