import { Button, Select } from '@mantine/core'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import ContainerFH from '../components/ContainerFH'

import { trpc } from "../utils/trpc"

const Home = () => {
  const router = useRouter()

  const [school, setSchool] = useState("")
  const schools = trpc.course.schools.useQuery()

  const [type, setType] = useState("")
  const types = trpc.course.types.useQuery({ school })

  const [courseCode, setCourseCode] = useState(0)
  const courses = trpc.course.courses.useQuery({ school, type })

  const [year, setYear] = useState(0)
  const duration = useMemo(() => {
    if (courseCode === 0 || !courses.isSuccess) return []
    const course = courses.data.find((c) => c.code === courseCode) ?? { duration: 0 }
    return Array(course.duration).fill(0)
  }, [courseCode])

  const [curricula, setcurricula] = useState("")
  const curriculas = trpc.course.curricula.useQuery({ code: courseCode },
    {
      enabled: courseCode !== 0,
      retry: 1,
    }
  )

  const reset = () => {
    setSchool("")
    setType("")
    setCourseCode(0)
    setYear(0)
    setcurricula("")
  }

  const valid = useMemo(() => {
    return school !== "" && type !== "" && courseCode !== 0 && year !== 0 && curricula !== ""
  }, [school, type, courseCode, year, curricula])

  return (
    <ContainerFH>
      <h2 className='text-center'>UNIBO-CALENDAR</h2>
      <form className='space-y-4'>
        <Select label="Scuola" placeholder='Seleziona una scuola' value={school} onChange={(e) => setSchool(e ?? "")}
          data={schools.data?.map((school) => (
            { label: school, value: school }
          )) ?? []
          } />
        <Select label="Tipologia" placeholder='Seleziona una tipologia' value={type} onChange={(e) => setType(e ?? "")} disabled={school === ""}
          data={types.data?.map((type) => (
            { label: type, value: type }
          )) ?? []
          } />
        <Select label="Corso" placeholder='Seleziona un corso' value={courseCode.toString()} onChange={(e) => setCourseCode(Number(e))} disabled={type === ""}
          data={courses.data?.map((course) => (
            { label: course.code + " - " + course.description, value: course.code.toString() }
          )) ?? []
          } />
        <Select label="Anno" placeholder='Seleziona un anno' value={year.toString()} onChange={(e) => setYear(Number(e))} disabled={courseCode === 0}
          data={duration.map((_, i) => (
            { label: (i + 1).toString(), value: (i + 1).toString() }
          ))
          } />
        <Select label="Curricula" placeholder='Seleziona un curricula' value={curricula} onChange={(e) => setcurricula(e ?? "")} disabled={year === 0}
          data={curriculas.data?.map((curricula) => (
            { label: curricula.label, value: curricula.value }
          )) ?? []
          } />
        <div className='space-x-3 flex justify-end'>
          <Button type="button" variant='default' onClick={reset}>Reset</Button>
          <Button type="button" disabled={!valid}
            onClick={() =>
              router.push({
                pathname: "/lessons",
                query: {
                  code: courseCode,
                  year,
                  curricula,
                },
              })
            }>Submit</Button>
        </div>
      </form>
    </ContainerFH>
  )
}

export default Home
