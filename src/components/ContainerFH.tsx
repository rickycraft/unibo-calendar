
export default function ContainerFH({ children }: { children: React.ReactNode }) {
  return (
    <div className='h-screen w-1/2 mx-auto flex flex-col justify-center'>
      {children}
    </div>
  )
}