
export const getTimetableUrl = async (baseUrl: string, year: number, curricola: string, start: Date, end: Date) => {
  return `${baseUrl}/orario-lezioni?anno=${year}&curricola=${curricola}&start=${start.toISOString().substring(0, 10)}&end=${end.toISOString().substring(0, 10)}`
}
