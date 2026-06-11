# middleware-custom

A minimal Express app demonstrating the middleware pattern with two hand-rolled middlewares.

## What we built

### Username middleware

Reads the `X-Username` request header and attaches its value to `req.username`. If the header is absent, attaches `null`. Always calls `next()` — it never rejects the request. The route handler decides what to do with a null username.

### JSON array body parser middleware

Reads the raw request body, parses it as JSON, and validates:
- Must be a JSON array
- Every element must be a string

If validation fails it rejects with `400`. On success it attaches the parsed array to `req.body` and calls `next()`.

### POST / endpoint

Uses both middlewares. Responds with plain text showing authentication status and the list of subjects.

## Install

```bash
npm install
```

## Run

```bash
node server.js
```

Server starts on `http://localhost:3000`.

## Test with curl

**Authenticated with valid body**
```bash
curl -X POST --data '["Birds","Bats","Lizards","Bees"]' -H "X-Username: Ahmed" http://localhost:3000
```
Expected:
```
You are authenticated as Ahmed.
You have requested information about 4 subjects: Birds, Bats, Lizards, Bees.
```

---

**No username header (unauthenticated)**
```bash
curl -X POST --data '["Birds","Bats"]' http://localhost:3000
```
Expected:
```
You are not authenticated.
You have requested information about 2 subjects: Birds, Bats.
```

---

**Body is not an array**
```bash
curl -X POST --data '"hello"' -H "X-Username: Ahmed" http://localhost:3000
```
Expected:
```json
{"error":"body must be a JSON array"}
```

---

**Array contains a non-string element**
```bash
curl -X POST --data '[1,"Bees"]' -H "X-Username: Ahmed" http://localhost:3000
```
Expected:
```json
{"error":"all array elements must be strings"}
```

---

**Invalid JSON**
```bash
curl -X POST --data 'not-json' -H "X-Username: Ahmed" http://localhost:3000
```
Expected:
```json
{"error":"body must be valid JSON"}
```
