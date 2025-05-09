export function getFormattedDateTime(): string {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    dateStyle: 'full',
    timeStyle: 'long'
  })
} 