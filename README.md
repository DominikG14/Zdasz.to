# Zdasz.to

Zdasz.to to aplikacja do ćwiczenia zadań maturalnych z matematyki. Interfejs zbudowano w React i Vite, API działa w Express, a dane są przechowywane w PostgreSQL. Baza jest zarządzana przez migracje i seedy Knex, a logowanie korzysta z tokenów JWT.

## Uruchomienie przez Docker

Wymagany jest Docker z Docker Compose.

1. Skopiuj przykładową konfigurację:

   ```powershell
   Copy-Item .env.example .env
   ```

2. W `.env` ustaw własny `JWT_SECRET` o długości co najmniej 32 znaków. Zmień też przykładowe hasła.
3. Uruchom aplikację:

   ```powershell
   docker compose up --build
   ```

Compose uruchomi PostgreSQL 16, wykona migracje i seed, a następnie uruchomi aplikację. Interfejs będzie dostępny pod adresem [http://localhost:8080](http://localhost:8080). PostgreSQL jest wystawiony na porcie `5433`, a pgAdmin na `5050`.

Seed dodaje działy, konto administratora i zadania z obrazów znajdujących się w `public/images/exercises`. Przy ponownym uruchomieniu aktualizuje katalog zadań bez tworzenia duplikatów.

## Uruchomienie lokalne

Wymagane są Node.js 22 oraz dostępna instancja PostgreSQL. Możesz uruchomić samą bazę przez Docker:

```powershell
Copy-Item .env.example .env
# Ustaw w .env własny JWT_SECRET (minimum 32 znaki)
docker compose up -d db
npm install
npm run db:setup
```

Następnie uruchom API i frontend w osobnych terminalach:

```powershell
npm run server
```

```powershell
npm run dev
```

Vite udostępnia aplikację pod adresem [http://localhost:5173](http://localhost:5173) i przekazuje żądania API do serwera działającego na porcie `3000`.

## Migracje i seedy

```powershell
npm run db:migrate   # zastosuj nowe migracje
npm run db:rollback  # cofnij ostatnią migrację
npm run db:seed      # uruchom seedy
npm run db:setup     # migracje, a następnie seedy
```

Połączenie z bazą lokalną ustawia `DATABASE_URL` w `.env`. Przykładowe wartości znajdują się w `.env.example`; plik `.env` nie jest dodawany do repozytorium.
