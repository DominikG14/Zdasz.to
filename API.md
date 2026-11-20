# API Reference — Zdasz.to

> Base URL (development): `http://localhost:3000`  
> Wszystkie endpointy zwracają JSON. Błędy mają format `{ "error": "..." }`.

## Uwierzytelnianie

Tokeny JWT są przekazywane jako **cookie `token`** (HttpOnly, ustawiane przez serwer).  
Endpointy chronione wymagają ważnego cookie — brak lub wygasły token zwraca **401**.

---

## Auth — `/api` i `/auth`

> Routy są dostępne pod obydwoma prefiksami (`/api/...` oraz `/auth/...`).

### `GET /api/me`
Zwraca dane zalogowanego użytkownika (lub `null` jeśli niezalogowany).

**Auth:** opcjonalna  
**Response 200**
```json
{ "user": { "id": 1, "username": "MatmaMistrz", "email": "mistrz@example.com", "isAdmin": false } }
```
Niezalogowany:
```json
{ "user": null }
```

---

### `POST /api/login`
Logowanie.

**Auth:** brak  
**Body**
```json
{
  "email": "mistrz@example.com",
  "password": "Haslo123",
  "returnUrl": "/dashboard"
}
```

| Pole | Typ | Wymagane | Opis |
|---|---|---|---|
| `email` | string | ✅ | Max 255 znaków |
| `password` | string | ✅ | 1–128 znaków |
| `returnUrl` | string | ❌ | URL przekierowania po logowaniu (musi zaczynać się od `/`) |

**Response 200** — ustawia cookie `token`
```json
{ "user": { "id": 1, "username": "MatmaMistrz", "isAdmin": false }, "returnUrl": "/dashboard" }
```
**Response 401** — błędne dane  
**Response 422** — błąd walidacji

---

### `POST /api/register`
Rejestracja nowego konta.

**Auth:** brak  
**Body**
```json
{
  "username": "NowyCzłowiek",
  "email": "nowy@example.com",
  "password": "Haslo123",
  "password2": "Haslo123",
  "returnUrl": "/"
}
```

| Pole | Typ | Wymagane | Walidacja |
|---|---|---|---|
| `username` | string | ✅ | 1–50 znaków |
| `email` | string | ✅ | format email, max 255 |
| `password` | string | ✅ | 8–128 znaków, min 1 mała + 1 wielka litera + 1 cyfra |
| `password2` | string | ✅ | musi być identyczne z `password` |
| `returnUrl` | string | ❌ | Bezpieczny URL wewnętrzny |

**Response 201** — ustawia cookie `token`
```json
{ "user": { "id": 42, "username": "NowyCzłowiek", "isAdmin": false }, "returnUrl": "/" }
```
**Response 409** — username lub email już istnieje  
**Response 422** — błąd walidacji

---

### `POST /api/logout`
Wylogowanie — kasuje cookie `token`.

**Auth:** brak  
**Response 200**
```json
{ "ok": true }
```

---

## Exercises — `/`

### `GET /fields`
Lista wszystkich działów tematycznych (bez "Mieszanych", `number = '0'`).

**Auth:** brak  
**Response 200**
```json
[
  { "id": 2, "number": "I", "name": "Liczby rzeczywiste", "exercises_count": 8 },
  { "id": 3, "number": "II", "name": "Wyrażenia algebraiczne", "exercises_count": 3 }
]
```

---

### `GET /exercises/field/:id`
Losowy zestaw zadań z wybranego działu.

**Auth:** brak  
**Params:** `id` — `integer > 0` (ID działu)  
**Query**

| Param | Typ | Domyślnie | Zakres |
|---|---|---|---|
| `limit` | integer | — | 1–100 |

**Response 200**
```json
{
  "fieldId": 2,
  "fieldInfo": { "id": 2, "number": "I", "name": "Liczby rzeczywiste" },
  "exercises": [
    { "id": 7, "image_url": "public/images/exercises/I/1.png", "type": "ABCD", "right_answer": "C" }
  ]
}
```
**Response 404** — dział nie istnieje lub nie ma zadań

---

### `GET /exercises/random`
Losowy zestaw zadań z wszystkich działów (sesja "Mieszane").

**Auth:** brak  
**Query**

| Param | Typ | Domyślnie | Zakres |
|---|---|---|---|
| `limit` | integer | — | 1–50 |

**Response 200**
```json
{
  "fieldId": 1,
  "fieldInfo": { "id": 1, "number": "0", "name": "Mieszane zadania" },
  "exercises": [
    { "id": 15, "image_url": "public/images/exercises/V/2.png", "type": "ABCD", "right_answer": "C" }
  ]
}
```

---

### `POST /exercises/save`
Zapisuje wynik ukończonej sesji quizowej.

**Auth:** ✅ wymagana (user)  
**Body**
```json
{
  "field_id": 2,
  "score": 7,
  "total": 10
}
```

| Pole | Typ | Walidacja |
|---|---|---|
| `field_id` | integer | > 0 |
| `score` | integer | ≥ 0, ≤ `total` |
| `total` | integer | > 0 |

**Response 201**
```json
{ "ok": true }
```
**Response 401** — brak autoryzacji  
**Response 422** — błąd walidacji

---

## Progress — `/`

### `GET /dashboard`
Statystyki zalogowanego użytkownika.

**Auth:** ✅ wymagana (user)  
**Response 200**
```json
{
  "byField": [
    {
      "number": "I",
      "name": "Liczby rzeczywiste",
      "attempts_count": 3,
      "score_sum": 21,
      "total_sum": 30,
      "last_solved_at": "2026-11-15T14:22:00Z"
    }
  ],
  "progress": [
    {
      "field_id": 2,
      "name": "Liczby rzeczywiste",
      "score": 8,
      "total": 10,
      "solved_at": "2026-11-15T14:22:00Z"
    }
  ]
}
```

> [!NOTE]
> `byField` jest posortowane po `field_id ASC`. Wiersze z `number = '0'` (Mieszane) są pomijane.

---

## Admin — `/admin`

> Wszystkie endpointy wymagają roli **ADMIN**.

### `GET /admin/users`
Lista użytkowników z opcjonalnym wyszukiwaniem.

**Auth:** ✅ ADMIN  
**Query**

| Param | Typ | Opis |
|---|---|---|
| `q` | string | Wyszukiwanie po `username` lub `email` (ILIKE) |

**Response 200**
```json
[
  { "id": 1, "username": "MatmaMistrz", "email": "mistrz@example.com" }
]
```

---

### `DELETE /admin/users/:id`
Usuwa konto użytkownika (kaskadowo usuwa jego postępy i role).

**Auth:** ✅ ADMIN  
**Params:** `id` — `integer > 0`  
**Response 200**
```json
{ "ok": true }
```
**Response 404** — użytkownik nie istnieje

---

### `GET /admin/exercises`
Pełny katalog zadań z listą działów.

**Auth:** ✅ ADMIN  
**Response 200**
```json
{
  "fields": [
    { "id": 2, "number": "I", "name": "Liczby rzeczywiste" }
  ],
  "exercises": [
    {
      "id": 1,
      "field_id": 2,
      "image_url": "public/images/exercises/I/1.png",
      "type": "ABCD",
      "right_answer": "C",
      "field_number": "I",
      "field_name": "Liczby rzeczywiste"
    }
  ]
}
```

> [!NOTE]
> `fields` nie zawiera rekordu `number = '0'`. `exercises` posortowane `id ASC`.

---

### `POST /admin/exercises`
Dodaje nowe zadanie. Przyjmuje `multipart/form-data`.

**Auth:** ✅ ADMIN  
**Body (form-data)**

| Pole | Typ | Wymagane | Walidacja |
|---|---|---|---|
| `field_id` | integer | ✅ | > 0 |
| `type` | string | ✅ | `ABCD` lub `PF` |
| `right_answer` | string | ✅ | `[A-D]` dla ABCD; `PP`/`PF`/`FP`/`FF` dla PF |
| `image` | file | ✅ | PNG, JPEG lub GIF |

**Response 201**
```json
{ "ok": true }
```

---

### `DELETE /admin/exercises/:id`
Usuwa zadanie wraz z plikiem graficznym.

**Auth:** ✅ ADMIN  
**Params:** `id` — `integer > 0`  
**Response 200**
```json
{ "ok": true }
```
**Response 404** — zadanie nie istnieje

---

### `GET /admin/users/:id/progress`
Postępy konkretnego użytkownika (admin-only).

> [!NOTE]
> Ten endpoint jest zarejestrowany w module `progress`, ale wymaga roli ADMIN.

**Auth:** ✅ ADMIN  
**Params:** `id` — `integer > 0` (ID użytkownika)  
**Response 200**
```json
{
  "username": "MatmaMistrz",
  "byField": [
    {
      "number": "I",
      "name": "Liczby rzeczywiste",
      "attempts_count": 3,
      "score_sum": 21,
      "total_sum": 30,
      "effectiveness_percent": 70.0,
      "last_solved_at": "2026-11-15T14:22:00Z"
    }
  ],
  "progress": [
    {
      "number": "I",
      "name": "Liczby rzeczywiste",
      "score": 8,
      "total": 10,
      "solved_at": "2026-11-15T14:22:00Z"
    }
  ]
}
```
**Response 404** — użytkownik nie istnieje

---

## Kody błędów

| Status | Znaczenie |
|---|---|
| `400` | Złe żądanie (np. nieprawidłowe parametry) |
| `401` | Brak autoryzacji / wygasły token |
| `403` | Brak uprawnień (wymagana rola ADMIN) |
| `404` | Zasób nie istnieje |
| `409` | Konflikt (np. duplikat username / email) |
| `422` | Błąd walidacji Zod — `{ "error": "...", "details": [...] }` |
| `500` | Nieoczekiwany błąd serwera |
