import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Loader2, Play, RotateCcw, Shuffle } from 'lucide-react'
import { db } from '../../lib/db'
import { offsetForTimeToday, setClockOffset } from '../../lib/clock'
import { importFromIkp } from '../../lib/ikp'
import { startRandomSession } from '../../lib/randomSession'
import { Logo } from '../../components/ui'

interface Path {
  title: string
  /** godzina, na którą "Uruchom" ustawia zegar demo */
  time: string
  steps: string[]
}

// 3 główne ścieżki użytkownika - to samo pokazujemy na pitchu
const PATHS: Path[] = [
  {
    title: 'Pominięta dawka',
    time: '08:35',
    steps: ['Opiekun: alert „brak potwierdzenia”', 'Senior: „Wziąłem”', 'Opiekun: alert znika'],
  },
  {
    title: 'Kończy się lek',
    time: '07:30',
    steps: ['Opiekun: „Za 3 dni kończy się Metformax”', '„Kup online” lub „Zadzwoń” do lekarza', 'Kalendarz: termin wykupu'],
  },
  {
    title: 'POMOC',
    time: '07:30',
    steps: ['Senior: „POMOC”', 'Opiekun: „Odbierz wideo”', '„Zakończ” po dowolnej stronie'],
  },
  {
    title: 'Senior dodaje lek',
    time: '07:30',
    steps: ['Senior: „Dodaj lek ręcznie” → nazwa, „Rano”', 'Senior: lek na liście na dziś', 'Opiekun: Leki → Dzisiaj, nowy lek o 08:00'],
  },
  {
    title: 'Umawianie wizyty',
    time: '07:30',
    steps: ['Opiekun: kafelek Lekarze → „Zadzwoń i umów”', '„Dodaj wizytę” → data → Zapisz', 'Senior: Moje zdrowie → Wizyty'],
  },
  {
    title: 'Wyniki badań',
    time: '07:30',
    steps: ['Opiekun: kafelek Badania → 2 wyniki poza normą', 'Senior: Moje zdrowie → Badania', 'Senior: „Skonsultuj z lekarzem”'],
  },
  {
    title: 'Programy i wsparcie',
    time: '07:30',
    steps: ['Opiekun: zakładka Programy', '„Bezpłatne leki 65+”, „Bon senioralny”', 'Źródło: oficjalna strona'],
  },
]

export default function SplitView() {
  const [busy, setBusy] = useState<string | null>(null)
  const [frameKey, setFrameKey] = useState(0) // zmiana = telefony wracają na ekran startowy
  const [randomTime, setRandomTime] = useState<string | null>(null)

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label)
    try {
      await fn()
    } finally {
      setBusy(null)
    }
  }

  const reset = async () => {
    await db.resetDemo(new Date())
    setClockOffset(0) // od razu, nie czekając na odświeżenie danych
    setFrameKey((k) => k + 1)
  }

  // czysty stan + leki z IKP + godzina pasująca do ścieżki
  const start = (path: Path) =>
    run(path.title, async () => {
      setRandomTime(null)
      await reset()
      await importFromIkp()
      await db.setDemoOffset(offsetForTimeToday(path.time))
    })

  return (
    <div className="flex min-h-full flex-col bg-primary-soft/40">
      <header className="flex flex-wrap items-center gap-4 border-b bg-white px-6 py-3">
        <Logo className="text-[30px]" />
        <span className="rounded-full bg-primary-soft/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">Tryb demo</span>
        <span className="text-xs text-muted">
          Dane: <b>{db.mode === 'supabase' ? 'Supabase (realtime, wiele urządzeń)' : 'lokalne (ta przeglądarka)'}</b>
        </span>
        <Link to="/" className="text-sm text-muted underline">
          Wybór roli
        </Link>
        <button
          disabled={!!busy}
          onClick={() =>
            run('reset', async () => {
              setRandomTime(null)
              await reset()
            })
          }
          className="ml-auto flex items-center gap-2 rounded-[10px] bg-danger px-5 py-2.5 font-semibold text-white shadow disabled:opacity-60"
        >
          {busy === 'reset' ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />} Zresetuj demo
        </button>
      </header>

      <p className="flex items-center justify-center gap-2 bg-primary px-6 py-2.5 text-center text-sm font-medium text-white">
        <Info size={16} className="shrink-0" />
        To wersja demo. Aby przetestować konkretne funkcje, zachęcamy do korzystania ze ścieżek po lewej.
      </p>

      <div className="flex flex-wrap items-start justify-center gap-6 p-6">
        {/* kolumna kończy się na wysokości dolnej krawędzi telefonu (napis 24px + odstęp 8px + 760px); ścieżki przewijają się w środku */}
        <section className="flex w-full max-w-xs flex-col gap-3 lg:h-[792px]">
          <article className="card border-2 border-success/40">
            <h2 className="flex items-center gap-2 font-semibold text-navy">
              <Shuffle size={18} className="text-success" /> Sesja wolna
            </h2>
            <p className="mt-1 text-sm text-muted">Losowe dane (godzina, zapas leków, wzięte dawki, wizyta) - eksploruj aplikację samodzielnie.</p>
            <button
              disabled={!!busy}
              onClick={() => run('random', async () => {
                await reset()
                setRandomTime(await startRandomSession())
              })}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-success py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy === 'random' ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} />}
              {busy === 'random' ? 'Losuję…' : randomTime ? `Losuj ponownie (teraz godz. ${randomTime})` : 'Losuj i uruchom'}
            </button>
          </article>

          <h2 className="text-lg font-semibold text-navy">Ścieżki użytkownika ({PATHS.length})</h2>
          <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {PATHS.map((p, i) => (
            <article key={p.title} className="card">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-white">{i + 1}</span>
                <h3 className="font-semibold text-navy">{p.title}</h3>
              </div>
              <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-sm">
                {p.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <button
                disabled={!!busy}
                onClick={() => start(p)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy === p.title ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                {busy === p.title ? 'Przygotowuję…' : `Uruchom (godz. ${p.time})`}
              </button>
            </article>
          ))}
          </div>
        </section>

        <Phone key={`s${frameKey}`} title="Senior" src="/senior" />
        <Phone key={`o${frameKey}`} title="Opiekun" src="/opiekun" />
      </div>
    </div>
  )
}

function Phone({ title, src }: { title: string; src: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-semibold text-muted">{title}</p>
      <div className="h-[760px] w-[370px] max-w-full overflow-hidden rounded-[2.5rem] border-[10px] border-navy bg-white shadow-2xl">
        <iframe src={src} title={title} className="h-full w-full" allow="camera; microphone; fullscreen; autoplay" />
      </div>
    </div>
  )
}
