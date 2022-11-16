export const SITE_HOST = 'calendar.rroveri.com'
export const S3_URL = "https://unibo-calendar.s3.eu-south-1.amazonaws.com"

const MONTH_SEPT = 10
export const currentYear = () => {
  const now = new Date()

  if (now.getMonth() < MONTH_SEPT) {
    // between Jan - Sep return last year
    return now.getFullYear() - 1
  } else {
    // between Oct - Dec return this
    return now.getFullYear()
  }
}