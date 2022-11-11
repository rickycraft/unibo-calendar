import fetch from 'node-fetch'

export const getCurriculas = async (baseUrl: string) => {
  const url = `${baseUrl}/@@available_curricula`
  console.log('curricula-url:', url)
  const res = await fetch(url)
  if (!res.ok) {
    console.log("curricula-error:", res.status)
    return undefined
  }
  const json = await res.json() as { value: string, label: string }[]
  const values = json.map(data => ({
    value: data.value,
    label: data.label
  }))
  return values
}