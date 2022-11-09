import fetch from 'node-fetch'

export const getcurriculas = async (baseUrl: string, lang: string) => {
  const l = (lang == 'Italiano') ? 'orario-lezioni' : 'timetable'
  const url = `${baseUrl}/${l}/@@available_curricula`
  const res = await fetch(url)
  if (!res.ok) return undefined
  const json = await res.json() as { value: string, label: string }[]
  const values = json.map(data => ({
    value: data.value,
    label: data.label
  }))
  return values
}