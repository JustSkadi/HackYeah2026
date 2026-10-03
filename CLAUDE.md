# CLAUDE.md

Projekt hackathonowy na **HackYeah 2026** (3–4 października 2026, Tauron Arena Kraków, 24h).
Robocza nazwa: **MójSenior** (do zmiany). Opis pomysłu w [README.md](README.md).

Ten plik to źródło prawdy dla zespołu i dla Claude: zakres, priorytety, stack, model danych i konwencje.
Przy każdej decyzji pytaj: *czy to poprawi demo albo ocenę jury?* Jeśli nie - nie rób.

---

## 1. Produkt w jednym zdaniu

Dwie zintegrowane aplikacje (jedna baza kodu, dwie role): **opiekun** zdalnie pilnuje leków, recept i wizyt seniora,
a **senior** ma ultraprostą aplikację z przypomnieniami, przyciskiem „Wziąłem” i przyciskiem „POMOC” (wideorozmowa).

## 2. Kategorie konkursowe i ocena

Celujemy w **SPORT & HEALTHCARE** (główna) i **ImpactHer: Technology for Real Change** (alternatywna).
Regulaminy: `029107f5-….pdf` (Sport & Healthcare, duplikat: `23b5d0fe-….pdf`), `8f63a03d-….pdf` + opis `b6340e4d-….pdf` (ImpactHer).

Kryteria (identyczne w obu):

| Kryterium | Waga |
|---|---|
| Idea & Innovation | 30% |
| Relation to Category | 20% |
| Practical Applicability / Usability | 20% |
| Design | 20% |
| Completeness & Implementation Value | **10%** |

**Wniosek:** ~90% punktów to pomysł, narracja, UX i wygląd. Dopracowana ścieżka główna > dużo funkcji > solidny backend.

Narracja (kod ten sam, zmieniają się slajdy 1–3 i persona):
- **Sport & Healthcare** - bohater: senior. Problem: pomijane dawki leków przewlekłych, przerwy w leczeniu bo skończył się lek. Wartość: adherencja, ciągłość leczenia, profilaktyka.
- **ImpactHer** - bohaterka: opiekunka (córka pracująca, z dziećmi, mama w innym mieście). Problem: obciążenie opieką. Wartość: spokój, mniej telefonów/dojazdów, informacja o wsparciu (bon senioralny). Wymaga statystyki ze źródłem.

TODO zespołu: potwierdzić na Discordzie, czy jeden projekt można zgłosić do dwóch kategorii, oraz godzinę deadline'u (regulamin mówi 11:00 **PM** 3.10 → 11:00 **PM** 4.10 - prawdopodobnie literówka, ma być AM).

Zgłoszenie (HackTribe, PL lub EN): tytuł, nazwa zespołu, skład (1–6 os.), opis, **PDF max 10 slajdów**. Opcjonalnie: repo, link do demo, screenshoty. Dodatkowo nagrywamy MP4 (max 3 min) jako backup demo.

## 3. Zakres

### MVP - ścieżka główna (musi działać w 100%)
1. Opiekun: „Importuj z IKP” → leki, lekarz, apteka wczytane z mocka.
2. Senior: ekran „Dziś” z lekami (duże kafelki) → przycisk **„Wziąłem”**.
3. Brak potwierdzenia w czasie `GRACE_MINUTES` → **alert u opiekuna** (realtime).
4. Senior: przycisk **„POMOC”** → wideorozmowa + alert u opiekuna z przyciskiem „Dołącz”.
5. Opiekun: prognoza zapasu leku → **„Za N dni kończy się lek - wykup receptę”** + link do apteki online.
6. Kalendarz: dawki + wizyty. Wizyty umawiane telefonicznie (`tel:` do lekarza z IKP), potem ręcznie dodane do kalendarza.
7. Karty programów rządowych dopasowane do seniora (wiek, leki) z linkiem do źródła. Oznaczenie „bezpłatny 65+” przy leku.

### Poza zakresem (tylko slajd „Roadmapa”)
- prawdziwa integracja z IKP / P1 / mObywatel
- umawianie wizyt przez API przychodni
- aktywny senior (wydarzenia w okolicy)
- logowanie, rejestracja, wielu seniorów na opiekuna, uprawnienia
- natywne aplikacje mobilne, push na iOS

### Zasady jakości
- **Zero martwych przycisków.** Niedziałające - ukryj albo oznacz „Wkrótce”.
- Nie piszemy: auth, walidacji formularzy, obsługi błędów poza ścieżką główną, testów jednostkowych (wyjątek: `lib/stock.ts`).
- **Feature freeze: ~6h przed deadline'em.** Potem tylko bugfixy, polish, slajdy, nagranie.

## 4. Stack

| Warstwa | Technologia | Uwagi |
|---|---|---|
| Frontend | **React + TypeScript + Vite** | SPA, PWA (manifest + ikona, bez skomplikowanego service workera) |
| Style/UI | **Tailwind CSS** + **shadcn/ui** | lucide-react do ikon |
| Routing | react-router | |
| Backend/DB | **Supabase** (Postgres + Realtime) | `@supabase/supabase-js`, bez własnego serwera |
| Wideo | **Daily.co** prebuilt (iframe) | Fallback: Jitsi. Przetestować wcześniej - publiczny meet.jit.si może wymagać logowania |
| Hosting | **Vercel** (lub Netlify) | Deploy z brancha `main`, publiczny link + QR |
| Daty | date-fns (+ date-fns-tz) | Strefa czasowa: `Europe/Warsaw` |

Dlaczego tak: jurorzy otwierają **jeden link na telefonie/laptopie**, bez instalacji. Supabase daje realtime (klik u seniora → zielono u opiekuna) bez pisania backendu.

### Zmienne środowiskowe (`.env.local`, nie commitować)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_DAILY_ROOM_URL=        # stały pokój demo, np. https://<team>.daily.co/mojsenior
VITE_GRACE_MINUTES=30       # po ilu minutach brak potwierdzenia = alert
VITE_REFILL_WARN_DAYS=7     # od ilu dni zapasu ostrzegać o recepcie
```
Te same zmienne ustawić w Vercel → Project Settings → Environment Variables.

### Komendy
Wymagany Node.js 20+ (LTS).
```
npm install
npm run dev        # lokalnie, http://localhost:5173
npm run build      # tsc + build produkcyjny (musi przejść przed merge do main)
npm run test       # vitest - lib/stock.test.ts
```
`vercel.json` ma już rewrite dla SPA.

### Tryby danych (`src/lib/db.ts`)
- **Lokalny** (brak `VITE_SUPABASE_*`): localStorage + BroadcastChannel. Działa od razu po `npm run dev`, synchronizuje karty/iframe'y jednej przeglądarki - wystarczy do pracy nad UI i do `/demo` na jednym laptopie.
- **Supabase** (ustawione `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`): realtime między urządzeniami - potrzebne, gdy juror ma seniora i opiekuna na dwóch telefonach.

Oba tryby mają to samo API (`Db`). Nowe operacje na danych dodawaj do interfejsu i **obu** implementacji.

### Setup Supabase (jednorazowo)
1. Nowy projekt na supabase.com → SQL Editor → uruchom `supabase/migrations/001_init.sql`, potem `supabase/seed.sql`.
2. Project Settings → API → skopiuj URL i anon key do `.env.local` (wzór: `.env.example`) i do Vercel.
3. Otwórz `/demo` → „Resetuj demo” (wgrywa lekarzy i wizytę).

## 5. Struktura projektu

```
src/
  main.tsx, App.tsx            # router + DataProvider
  index.css                    # Tailwind v4 + tokeny kolorów (@theme)
  routes/
    RoleSelect.tsx             # "/"  - "Jestem seniorem" / "Jestem opiekunem"
    senior/Today.tsx           # "/senior" - dawki na dziś, "Wziąłem", POMOC
    senior/Help.tsx            # "/senior/pomoc" - wideorozmowa + help_request
    caregiver/Layout.tsx       # nawigacja dolna, pełnoekranowy alert POMOC, dźwięk alertów
    caregiver/Dashboard.tsx    # "/opiekun" - alerty (pominięte dawki, recepty), oś dnia, wizyta
    caregiver/Medications.tsx  # "/opiekun/leki" - import IKP, zapas leków, "Bezpłatny 65+"
    caregiver/Calendar.tsx     # "/opiekun/kalendarz" - 14 dni: wizyty, wykup recept
    caregiver/Doctors.tsx      # "/opiekun/lekarze" - tel: + dodanie wizyty
    caregiver/Programs.tsx     # "/opiekun/programy" - karty programów ze źródłami
    demo/SplitView.tsx         # "/demo" - dwa telefony (iframe) + panel czasu/resetu
  lib/
    types.ts                   # typy = tabele SQL
    config.ts                  # env, DEMO_SENIOR_ID, PHARMACY_SEARCH_URL
    db.ts                      # warstwa danych: local | supabase
    data.tsx                   # DataProvider/useData: snapshot, zegar, dzisiejsze dawki, alerty
    clock.ts                   # czas z przesunięciem demo (patrz §7)
    stock.ts (+ .test.ts)      # prognoza zapasu leków
    doses.ts                   # terminy dawek, statusy
    ikp.ts                     # "import" z mocka
    format.ts, alert.ts        # formatowanie dat (pl), dźwięk/wibracja
  data/
    ikp-mock.json              # leki (purchase_days_ago - względne daty!), lekarze
    programs.json              # programy rządowe ze źródłami
    seed.ts                    # senior demo, lekarze, wizyta - używane przez reset
supabase/
  migrations/001_init.sql      # schemat + otwarte RLS + realtime
  seed.sql                     # senior + demo_state
```
shadcn/ui nie jest jeszcze dodany - opcjonalnie, jeśli zespół chce gotowych komponentów.

## 6. Model danych (Supabase / Postgres)

Jeden senior i jeden opiekun w demo - nie budujemy kont. Wszystkie tabele mają `senior_id` na przyszłość.

```sql
create table seniors (
  id uuid primary key default gen_random_uuid(),
  name text not null,              -- "Halina Kowalska"
  birth_date date not null,        -- do filtrowania programów (65+, 75+)
  sex text,                        -- 'F' | 'M' (programy profilaktyczne)
  caregiver_name text,
  caregiver_phone text
);

create table doctors (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid references seniors(id) on delete cascade,
  name text not null,
  specialty text,                  -- "lekarz rodzinny", "kardiolog"
  clinic text,
  phone text not null              -- używane w linku tel:
);

create table medications (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid references seniors(id) on delete cascade,
  name text not null,              -- "Metformax 500"
  active_substance text,
  dose_label text not null,        -- "1 tabletka"
  units_per_dose numeric not null default 1,
  times text[] not null,           -- ['08:00','20:00'] (Europe/Warsaw)
  package_size int not null,       -- sztuk w opakowaniu
  packages_bought int not null default 1,
  purchase_date date not null,     -- z IKP (data realizacji recepty)
  pharmacy text,                   -- z IKP
  prescribing_doctor_id uuid references doctors(id),
  free_65 boolean default false,   -- na liście "Bezpłatne leki 65+"
  color text,                      -- kolor/wygląd tabletki dla seniora
  image_url text,
  buy_online_url text,             -- link do apteki/wyszukiwarki
  source text default 'ikp'        -- 'ikp' | 'manual'
);

create table dose_events (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id) on delete cascade,
  scheduled_at timestamptz not null,
  taken_at timestamptz,            -- null = nie potwierdzono
  unique (medication_id, scheduled_at)
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid references seniors(id) on delete cascade,
  doctor_id uuid references doctors(id),
  starts_at timestamptz not null,
  place text,
  note text
);

create table help_requests (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid references seniors(id) on delete cascade,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table demo_state (           -- jeden wiersz, wspólny dla wszystkich ekranów
  id int primary key default 1,
  time_offset_minutes int not null default 0
);
```

Realtime włączyć dla: `dose_events`, `help_requests`, `demo_state`, `appointments`
(Supabase → Database → Replication, albo `alter publication supabase_realtime add table ...`).

**RLS:** na hackathon permisywne polityki dla roli `anon` (select/insert/update na wszystko). W bazie są **wyłącznie fikcyjne dane demo** - nigdy prawdziwe dane zdrowotne. Na slajdzie architektury uczciwie: „w produkcji: auth + RLS per opiekun”.

## 7. Kluczowa logika

### Zegar demo (`lib/clock.ts`)
- `now() = Date.now() + demo_state.time_offset_minutes`. **Cała aplikacja używa `now()` z clock.ts, nigdy `new Date()` bezpośrednio** do logiki dawek/alertów.
- Offset trzymany w Supabase i subskrybowany realtime → przesunięcie czasu działa jednocześnie na telefonie jurora-seniora i jurora-opiekuna.
- Przyciski w trybie demo: „+30 min”, „Ustaw 8:35”, „Resetuj demo”.

### Statusy dawek (`lib/doses.ts`)
- Dawki na dziś generowane z `medications.times` (upsert do `dose_events`, unikalność `(medication_id, scheduled_at)`).
- Status liczony, nie zapisywany:
  - `taken` - `taken_at != null`
  - `upcoming` - `now < scheduled_at`
  - `due` - `scheduled_at <= now < scheduled_at + GRACE_MINUTES` (u seniora: pulsujący kafelek)
  - `missed` - `now >= scheduled_at + GRACE_MINUTES` i brak `taken_at` → **alert u opiekuna**
- „Wziąłem” = `update dose_events set taken_at = now()`.

### Prognoza zapasu (`lib/stock.ts`) - wyróżnik projektu, pokryć testami
```
total_units   = package_size * packages_bought
daily_units   = units_per_dose * times.length
days_elapsed  = dni od purchase_date do today()   (today z clock.ts)
expected_left = max(0, total_units - daily_units * days_elapsed)   // "ile POWINNO zostać"
days_left     = floor(expected_left / daily_units)
runout_date   = purchase_date + floor(total_units / daily_units) dni
refill_by     = runout_date - REFILL_WARN_DAYS
```
- `days_left <= REFILL_WARN_DAYS` → karta „Za N dni kończy się {lek} - wykup receptę” + `buy_online_url` + telefon do lekarza wystawiającego.
- Opcjonalnie (jeśli starczy czasu): `actual_left` liczony z potwierdzonych dawek - pokazuje rozjazd „powinno vs. faktycznie”.
- Data wykupu recepty pojawia się w kalendarzu opiekuna.

### Mock IKP (`data/ikp-mock.json` + `lib/ikp.ts`)
- Przycisk „Importuj z IKP” → sztuczne ~1.5 s ładowania (spinner „Łączenie z Internetowym Kontem Pacjenta…”) → upsert leków i lekarzy do Supabase.
- Kształt danych naśladuje e-receptę: nazwa, substancja, dawkowanie, wielkość opakowania, data realizacji, apteka, lekarz wystawiający.
- Dobrać daty zakupu tak, żeby w dniu demo **jeden lek kończył się za 3 dni** (pokazanie alertu o recepcie).

### Pomoc / wideo
- Senior „POMOC” → insert do `help_requests` + otwarcie `VITE_DAILY_ROOM_URL` w iframe.
- Opiekun subskrybuje `help_requests` → pełnoekranowy alert „Halina prosi o pomoc” + „Dołącz” (ten sam pokój).
- Na demo mieć gotowy fallback (zrzut ekranu / nagranie), gdyby Wi-Fi na hali nie udźwignęło wideo.

### Alerty
- Wyłącznie **w aplikacji**: toast/baner + dźwięk (+ `navigator.vibrate` gdzie działa). Web Push na iOS działa tylko po dodaniu PWA do ekranu głównego - nie polegamy na nim.

### Programy rządowe (`data/programs.json`)
```json
{
  "id": "leki-65",
  "title": "Bezpłatne leki 65+",
  "min_age": 65,
  "summary": "Leki z wykazu za darmo dla osób 65+. Lista aktualizowana co kwartał.",
  "action": "Zapytaj lekarza o receptę z oznaczeniem S",
  "source_name": "gov.pl",
  "source_url": "https://www.gov.pl/web/gov/korzystaj-z-bezplatnych-lekow-75",
  "verified_at": "2026-10-03"
}
```
- Filtrowanie po wieku/płci seniora. Każda karta **musi** mieć `source_url`. Treści zweryfikować na oficjalnych stronach przed demo (lista w README).

## 8. Design

### Senior (`/senior`) - wizytówka projektu, punkty za Design i Usability
- Font bazowy **≥ 22px**, nagłówki ≥ 32px; przyciski **≥ 64px** wysokości, pełna szerokość.
- Kontrast min. **WCAG AA** (lepiej AAA dla tekstu głównego). Nie przekazywać informacji samym kolorem - zawsze ikona + tekst.
- Max 3–4 elementy na ekranie, jedna kolumna, brak gestów (swipe, long-press), brak ukrytych menu.
- Lek = kolor/zdjęcie tabletki + nazwa + godzina + „1 tabletka”.
- „POMOC” - zawsze widoczny, czerwony, przypięty do dołu ekranu.
- Język: proste zdania, bez żargonu („Weź teraz”, „Wziąłem ✅”).

### Opiekun (`/opiekun`) - nowoczesny dashboard
- Oś czasu dnia ze statusami (zielony/żółty/czerwony + ikona), karty leków z paskiem zapasu, sekcja alertów na górze.
- Mobile-first, ale ładnie też na laptopie.

### Wspólne
- Tokeny kolorów w `tailwind.config` (primary, success, warning, danger). Język UI: **polski**.

## 9. Tryb demo dla jury

- `/` - bez logowania: „Jestem opiekunem” / „Jestem seniorem”, od razu na danych Pani Haliny (78 lat, 4 leki, lekarz rodzinny, kardiolog, wizyta w kalendarzu).
- `/demo` - dwa ekrany telefonów obok siebie (iframe `/senior` i `/opiekun`) + panel: przesuń czas, resetuj demo.
- „Resetuj demo” - przywraca `seed.sql` (usuwa potwierdzenia, help_requests, offset = 0).
- Link + **kod QR** na slajdzie 10 i w opisie zgłoszenia.

### Scenariusz demo (3 min)
1. **Problem (30 s)** - persona + jedna liczba (zależnie od kategorii).
2. **Demo (2 min)** na `/demo`: import z IKP → „ustaw 8:35” → alert o pominiętej dawce u opiekuna → senior „POMOC” → wideo → senior „Wziąłem” → zielono u opiekuna → „za 3 dni kończy się lek” + „ten lek przysługuje za darmo 65+”.
3. **Wartość + roadmapa (30 s)**.

Nagrać MP4 zaraz po feature freeze (backup na wypadek problemów z siecią).

## 10. Slajdy (max 10)
1. Tytuł + jedno zdanie
2. Problem + persona
3. Dlaczego obecne rozwiązania nie wystarczają
4. Rozwiązanie: dwie aplikacje, jeden ekosystem
5. Kluczowe funkcje (screenshoty)
6. Design dla seniora (dostępność)
7. Architektura (mock IKP teraz → docelowa integracja)
8. Wpływ
9. Roadmapa / model wdrożenia
10. Zespół + QR do demo

## 11. Plan pracy (24h)

| Czas | Co |
|---|---|
| 0–2h | Wspólnie: model danych, makiety ekranów, szkielet repo, Supabase, deploy „hello world” na Vercel |
| 2–12h | Równolegle: UI seniora / panel opiekuna / logika (stock, doses, clock, realtime, mock IKP) / research + slajdy |
| 12–18h | Integracja ścieżki głównej end-to-end, tryb demo, wideo |
| **~18h** | **Feature freeze** |
| 18–22h | Polish UI, testy na prawdziwych telefonach (iOS + Android), nagranie MP4, slajdy |
| 22–24h | Bufor, zgłoszenie na HackTribe |

Podział ról (dostosować do zespołu): UI seniora · panel opiekuna · backend/logika/demo · pitch/research/QA.

## 12. Konwencje

- Kod, nazwy plików, identyfikatory: **angielski**. Teksty UI: **polski**.
- Branch `dev` do pracy, `main` = to, co widzi jury (auto-deploy). Merge do `main` tylko działającej wersji.
- Małe, częste commity. Przed merge do `main`: `npm run build` przechodzi.
- Czas: zawsze przez `lib/clock.ts`. Daty w bazie jako `timestamptz`, wyświetlanie w `Europe/Warsaw`.
- Nie dodawać nowych zależności bez potrzeby. Nie budować rzeczy z sekcji „Poza zakresem”.
