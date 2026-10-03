// Jedyne źródło czasu w aplikacji. Offset pochodzi z demo_state i jest wspólny
// dla wszystkich ekranów, więc "przesuń czas" działa jednocześnie u seniora i opiekuna.
// Do logiki dawek/alertów NIE używaj new Date() bezpośrednio.

let offsetMinutes = 0

export function setClockOffset(minutes: number) {
  offsetMinutes = minutes
}

export function getClockOffset() {
  return offsetMinutes
}

export function now(): Date {
  return new Date(Date.now() + offsetMinutes * 60_000)
}

/** Offset potrzebny, żeby zegar pokazał podaną godzinę dzisiaj (HH:mm). */
export function offsetForTimeToday(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  const real = new Date()
  const target = new Date(real)
  target.setHours(h, m, 0, 0)
  return Math.round((target.getTime() - real.getTime()) / 60_000)
}
