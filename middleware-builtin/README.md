# middleware-builtin

A copy of `middleware-custom` where the hand-rolled JSON array parser is replaced by Express's built-in `express.json()` middleware.

## What changed from middleware-custom

The `jsonArrayMiddleware` function is removed entirely. In its place:

```js
app.use(express.json());
```

`express.json()` handles reading the raw body stream and parsing it as JSON. What it does **not** do is validate the shape — it won't check whether the result is an array or whether its elements are strings. That validation now lives in the route handler itself.

### Key difference: Content-Type is now required

`express.json()` only parses the body when the request has `Content-Type: application/json`. Without it, `req.body` is `undefined` and the array check in the route handler catches it with a 400.

This is why the `curl` commands below include `-H "Content-Type: application/json"` — without that header, the body is ignored.

### Key difference: body-parser strict mode

`express.json()` runs in strict mode by default, which means it only accepts arrays and objects as top-level JSON values. A bare string like `"hello"` is rejected by body-parser itself before the route handler runs. We add an error-handling middleware to return a clean JSON 400 instead of Express's default HTML error page.

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
curl -X POST --data '["Birds","Bats","Lizards","Bees"]' -H "X-Username: Ahmed" -H "Content-Type: application/json" http://localhost:3000
```
Expected:
```
You are authenticated as Ahmed.
You have requested information about 4 subjects: Birds, Bats, Lizards, Bees.
```

---

**Missing Content-Type header (body not parsed)**
```bash
curl -X POST --data '["Birds","Bats"]' -H "X-Username: Ahmed" http://localhost:3000
```
Expected:
```json
{"error":"body must be a JSON array"}
```
> `express.json()` ignores the body when Content-Type is absent. `req.body` is `undefined`, which is not an array.

---

**No username header (unauthenticated)**
```bash
curl -X POST --data '["Birds","Bats"]' -H "Content-Type: application/json" http://localhost:3000
```
Expected:
```
You are not authenticated.
You have requested information about 2 subjects: Birds, Bats.
```

---

**Body is not an array (rejected by body-parser strict mode)**
```bash
curl -X POST --data '"hello"' -H "X-Username: Ahmed" -H "Content-Type: application/json" http://localhost:3000
```
Expected:
```json
{"error":"body must be valid JSON"}
```

---

**Array contains a non-string element**
```bash
curl -X POST --data '[1,"Bees"]' -H "X-Username: Ahmed" -H "Content-Type: application/json" http://localhost:3000
```
Expected:
```json
{"error":"all array elements must be strings"}
```
