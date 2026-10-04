import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

export const fmtDay = (d: Date) => format(d, 'EEEE, d MMMM', { locale: pl })
export const fmtDate = (d: Date) => format(d, 'd MMMM', { locale: pl })
export const fmtDateYear = (d: Date) => format(d, 'd MMMM yyyy', { locale: pl })
export const fmtDateTime = (iso: string) => format(parseISO(iso), "d MMMM, 'godz.' HH:mm", { locale: pl })
export const fmtTime = (d: Date) => format(d, 'HH:mm')
export const firstName = (fullName: string) => fullName.split(' ')[0]
