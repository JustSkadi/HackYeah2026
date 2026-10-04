# HackYeah2026

Opis pomysłu na aplikację MójSenior (nazwa do zmainy xD):
2 wersje aplikacji zintegrowane ze sobą na 2 różnych urządzeniach:
1. Dla opiekuna danego seniora
2. Dla samego seniora (prostsza z większymi literami)

Głównym zmysłem jest to, że seniorzy często nie pamiętają lub nie obchodzą ich ich kwestie zdrowotne np. pamiętanie o wykupieniu recepty, wzięciu leku etc. Ma w tym im pomóc opiekun, który będzie prowadził takiemu seniorowi kalendarz, gdzie będzie miał zaznaczone:
- przypominajki jaki lek, w jakiej dawce, ile z opakowania POWINNO MU ZOSTAĆ, w jakiej aptece były kupione leki ( dane z ikp ) etc. ma dziś senior wziąć
- zaznaczona data kiedy trzeba wykupić daną receptę na podstawie danych z aplikacji ikp, gdzie jest podana dawka, data zakupu i ile jest w opakowaniu
- zaznaczone wizyty u lekarza danego seniora

Oprócz kalendarza:
- potwierdzanie wzięcia leku przez seniora ( duży przycisk "Wziąłem" ) - jeśli senior nie potwierdzi w ciągu X minut od godziny przyjęcia, opiekun dostaje alert
- umawianie wizyt przez telefon - z ikp mamy lekarza i jego dane, więc przy lekarzu jest przycisk "Zadzwoń" ( link `tel:` ), a po rozmowie opiekun dodaje wizytę do kalendarza
- najważniejsze informacje z programów rządowych ze źródłami ( szczegóły niżej )
- opcja awaryjna - możliwość zadzwonienia do seniora z kamerką, aby pokazywał nam co się aktualnie dzieje
- możliwość wykupienia auotmatycznie danej recepty online ( przekierowanie na stronę zew jak istnieje )


Wersja dla seniora:
Podobnie, ale trochę mniej opcji ( na pewno musi zostać kalendarz, przycisk "Wziąłem" przy leku i przycisk "POmoc" gdzie akutomatycznie dzwoni na kamerce do opiekuna )


## Programy rządowe

Nie newsletter, tylko krótkie karty z najważniejszymi informacjami, dopasowane do seniora ( wiek, leki ) i z linkiem do oficjalnego źródła. Np.:

| Program | Dla kogo | Co daje | Źródło |
|---|---|---|---|
| Bezpłatne leki 65+ | 65+ | Leki z wykazu za darmo ( lista zmienia się co kwartał ) - w aplikacji oznaczamy przy leku "przysługuje za darmo" | [gov.pl](https://www.gov.pl/web/gov/korzystaj-z-bezplatnych-lekow-75) |
| Moje Zdrowie - bilans zdrowia | od 20 r.ż., 50+ co 3 lata | Bezpłatne badania + Indywidualny Plan Zdrowotny | [gov.pl](https://www.gov.pl/web/psse-choszczno/dbaj-o-siebie-z-programem-moje-zdrowie) |
| Szczepienie przeciw grypie | 65+ / 75+ | Refundowana / bezpłatna szczepionka, kwalifikacja również w aptece | [pacjent.gov.pl](https://pacjent.gov.pl/print/pdf/node/3246) |
| Bon senioralny | 65+, kryterium dochodowe | Usługi opiekuńcze w domu opłacane przez gminę ( start Q4 2026 ) | [gazetaprawna.pl](https://www.gazetaprawna.pl/twoje-prawo/swiadczenia/artykuly/11282012,bon-senioralny-2026-dla-kogo-kryteria-zasady-2150-zl.html) |

Na hackathon dane programów trzymamy jako statyczny JSON ( nazwa, kryteria, opis, link do źródła ) i filtrujemy po wieku seniora. Przed demo trzeba zweryfikować aktualność kryteriów na oficjalnych stronach.


## Poza zakresem ( roadmapa )
- prawdziwa integracja z IKP ( na hackathonie mock danych )
- aktywny senior - wydarzenia i pomysły na spędzenie czasu z seniorem w okolicy
