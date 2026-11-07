# Zdasz.to

Aplikacja do nauki matematyki maturalnej. Frontend używa React, backend Express.js, a dane są przechowywane w PostgreSQL.

## Uruchomienie przez Docker

Wymagany jest Docker z Compose. Uruchom:

```sh
docker compose up --build
```

Aplikacja będzie dostępna pod `http://localhost:8080`, pgAdmin pod `http://localhost:5050`. Domyślne dane PostgreSQL: `docker` / `docker`, baza `db`. Ustaw własne `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` oraz `SESSION_SECRET` przed wdrożeniem.

Schemat, działy, zadania i konta demonstracyjne tworzy `docker/db/init/init.sql` przy pierwszym uruchomieniu pustego wolumenu bazy.

## Uruchomienie lokalne

Wymagane Node.js 22+ i PostgreSQL z załadowanym `docker/db/init/init.sql`.

```sh
npm install
npm run server
```

W drugim terminalu można uruchomić frontend developerski przez `npm run dev`. Zmienne połączenia bazy: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`. Domyślnie API oczekuje PostgreSQL pod hostem `db` w Dockerze.

## Funkcjonalności

- nauka po działach oraz losowy test mieszany, w tym odpowiedzi ABCD i P/F;
- podsumowanie testu i zachowanie wyniku anonimowego w sesji przeglądarki;
- rejestracja, logowanie i sesje przechowywane w PostgreSQL;
- historia podejść i zestawienia wyników według działów;
- panel administratora: wyszukiwanie i usuwanie użytkowników, podgląd postępów, dodawanie zadań z obrazem.

Konto administratora i przykładowe konta są definiowane w skrypcie inicjalizacji bazy.
