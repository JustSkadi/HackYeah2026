export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  dailyRoomUrl: import.meta.env.VITE_DAILY_ROOM_URL as string | undefined,
  graceMinutes: Number(import.meta.env.VITE_GRACE_MINUTES ?? 30),
  refillWarnDays: Number(import.meta.env.VITE_REFILL_WARN_DAYS ?? 7),
}

export const DEMO_SENIOR_ID = '00000000-0000-4000-8000-000000000001'

// TODO: podmienić na docelową wyszukiwarkę/aptekę online (z nazwą leku w URL, jeśli serwis to wspiera)
export const PHARMACY_SEARCH_URL = 'https://www.gdziepolek.pl'
