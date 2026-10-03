export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  dailyRoomUrl: import.meta.env.VITE_DAILY_ROOM_URL as string | undefined,
  graceMinutes: Number(import.meta.env.VITE_GRACE_MINUTES ?? 30),
  refillWarnDays: Number(import.meta.env.VITE_REFILL_WARN_DAYS ?? 7),
}

export const DEMO_SENIOR_ID = '00000000-0000-4000-8000-000000000001'

// Wyszukiwarka leku w aptekach - nazwa leku doklejana jako ?q=
export const PHARMACY_SEARCH_URL = 'https://www.gdziepolek.pl/wyszukiwanie?q='

export function buyOnlineUrl(med: { name: string; buy_online_url: string | null }): string {
  return med.buy_online_url ?? PHARMACY_SEARCH_URL + encodeURIComponent(med.name)
}

// Nagrane filmy do symulowanej wideorozmowy (pliki w public/video/). Brak pliku = awatar z literą.
export const DEMO_VIDEO = {
  caregiver: '/video/opiekun.mp4', // widzi senior po kliknięciu POMOC
  senior: '/video/senior.mp4', // widzi opiekun po "Odbierz wideo"
}
