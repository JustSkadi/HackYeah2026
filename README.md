# MySenior

**Leki, recepty i wizyty seniora pod kontrolą opiekuna.**

Projekt przygotowany na **HackYeah 2026** (Kraków, 3–4 października 2026), kategoria **Sport & Healthcare**.

MySenior to dwie zintegrowane aplikacje w jednej bazie kodu:

- **Senior** - ultraprosty ekran z dzisiejszymi lekami, dużym przyciskiem **„Wziąłem”** i zawsze widocznym przyciskiem **„POMOC”**, który łączy z opiekunem przez wideorozmowę.
- **Opiekun** - nowoczesny pulpit, z którego zdalnie widać, czy senior wziął leki, kiedy skończy się lek i trzeba wykupić receptę, jakie wizyty są zaplanowane i z jakich programów rządowych może skorzystać.

## Problem

Seniorzy chorujący przewlekle często pomijają dawki leków albo przerywają leczenie, bo lek skończył się, zanim ktoś wykupił kolejną receptę. Opiekunowie, zwykle dorosłe dzieci mieszkające w innym mieście, nie mają jak tego sprawdzić bez ciągłych telefonów i dojazdów.

## Kluczowe funkcje

| Funkcja | Jak działa |
|---|---|
| **Import z IKP** | Leki, lekarze, apteki, skierowania, badania i dokumenty wczytywane jednym przyciskiem (w wersji demo z danych testowych imitujących Internetowe Konto Pacjenta). |
| **Przypomnienia i „Wziąłem”** | Senior widzi duże kafelki leków z godziną i dawką. Kafelek pulsuje, gdy nadchodzi pora leku. |
| **Alert o pominiętej dawce** | Jeśli senior nie potwierdzi leku w ciągu 30 minut, opiekun od razu dostaje alert (dźwięk + baner). |
| **POMOC → wideorozmowa** | Jeden czerwony przycisk u seniora otwiera rozmowę wideo, a u opiekuna wyświetla pełnoekranowy alert z przyciskiem „Odbierz”. |
| **Prognoza zapasu leków** | Na podstawie daty wykupu, wielkości opakowania i dawkowania aplikacja liczy, ile leku powinno zostać: „Za 3 dni kończy się lek - wykup receptę” + link do wyszukiwarki aptek. |
| **Kalendarz** | Dawki, wizyty i terminy wykupu recept w widokach dzień / 3 dni / tydzień / miesiąc. |
| **Lekarze i wizyty** | „Zadzwoń i umów” do lekarza z IKP, a po rozmowie wizyta trafia do kalendarza. |
| **Programy rządowe** | Karty dopasowane do wieku seniora (np. Bezpłatne leki 65+, bilans zdrowia, szczepienie przeciw grypie, bon senioralny), każda z linkiem do oficjalnego źródła. |
| **Ręczne dodawanie leków** | Dostępne zarówno dla opiekuna, jak i dla seniora (duże przyciski, prosty formularz). |

## Dostępność dla seniora

- Tekst bazowy co najmniej 22 px, nagłówki co najmniej 32 px, przyciski co najmniej 64 px wysokości.
- Kontrast zgodny z WCAG AA. Informacja nigdy nie jest przekazywana samym kolorem, zawsze idzie z nią ikona i tekst.
- Jedna kolumna, bez gestów i ukrytych menu, proste komunikaty („Weź teraz”, „Wziąłem”).
- Przycisk „POMOC” przypięty do dołu każdego ekranu.

## Tryb demo

Aplikacja nie wymaga logowania. Na stronie startowej można wybrać:

- **Tryb demo** (`/demo`) - dwa telefony obok siebie (senior i opiekun) i siedem gotowych ścieżek użytkownika uruchamianych jednym kliknięciem: pominięta dawka, kończący się lek, POMOC i wideo, dodanie leku przez seniora, umówienie wizyty, wyniki badań i programy rządowe. Jest też „Sesja wolna” z losowymi danymi do samodzielnego eksplorowania.
- **Jestem seniorem** (`/senior`) i **Jestem opiekunem** (`/opiekun`) - każda rola osobno, np. na dwóch telefonach.

Dane demo dotyczą fikcyjnej pani Haliny Kowalskiej (78 lat) i jej córki Anny. Aplikacja nie przechowuje żadnych prawdziwych danych medycznych.

## Technologie

- **React 19 + TypeScript + Vite** - aplikacja SPA/PWA otwierana jednym linkiem, bez instalacji
- **Tailwind CSS v4**, ikony **lucide-react**
- **Supabase** (Postgres + Realtime) - synchronizacja seniora i opiekuna w czasie rzeczywistym
- **date-fns** - daty w strefie `Europe/Warsaw`
- **Vitest** - testy logiki prognozy zapasu leków
- Hosting: **Vercel**

## Uruchomienie lokalne

Wymagany Node.js 20+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build produkcyjny
npm run test     # testy
```

Bez konfiguracji aplikacja działa w **trybie lokalnym** (localStorage + synchronizacja między kartami jednej przeglądarki), co wystarcza do `/demo` na jednym komputerze.

Aby zsynchronizować dwa urządzenia, skopiuj `.env.example` do `.env.local` i uzupełnij dane Supabase:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_DAILY_ROOM_URL=        # opcjonalnie: pokój Daily.co do prawdziwej wideorozmowy
VITE_GRACE_MINUTES=30       # po ilu minutach brak potwierdzenia = alert
VITE_REFILL_WARN_DAYS=7     # od ilu dni zapasu ostrzegać o recepcie
```

W Supabase uruchom w SQL Editor `supabase/migrations/001_init.sql`, a potem `supabase/seed.sql`.

## Struktura

```
src/
  routes/senior/     ekrany seniora (Dziś, POMOC, kalendarz, wizyty, badania, lekarze)
  routes/caregiver/  pulpit opiekuna (leki, kalendarz, lekarze, programy, dokumenty)
  routes/demo/       widok demo z dwoma telefonami i ścieżkami
  components/        wspólne komponenty UI, kalendarz, wideorozmowa, połączenie
  lib/               dane (lokalnie / Supabase), zegar demo, dawki, prognoza zapasu
  data/              dane demo IKP i programy rządowe
supabase/            schemat bazy i dane startowe
```

## Roadmapa

- Prawdziwa integracja z IKP / P1 / mObywatel
- Umawianie wizyt przez API przychodni
- Konta, uprawnienia i wielu seniorów na jednego opiekuna
- Powiadomienia push i aplikacje natywne
- Aktywny senior: wydarzenia i zajęcia w okolicy
