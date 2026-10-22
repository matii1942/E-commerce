# Tienda

A storefront with a product catalogue, category filtering, accounts and a cart
that checks out, served by an Express API over MongoDB. Two applications in one
repository, brought up with a single command.

> **Status:** the catalogue, registration, login and ordering are live against
> the database. **The server prices every order.** The browser stores product
> identifiers and quantities and nothing else; it sends identifiers and
> quantities to `POST /api/orders`, and the API looks the prices up, checks the
> stock and computes the total itself.

---

## The two halves, and why they were joined

This started as two separate projects from a full stack course: a storefront
whose products came from a hand-written JavaScript array, and an Express API
with Mongoose models for products, categories and users that nothing consumed.

Neither was finished on its own. The storefront had no database; the API had no
interface. They are now one project, and joining them meant reading the API
closely — which surfaced fifteen defects, listed below, because finding them is
most of what the work was.

## Architecture

```
apps/
├─ api/     Express + Mongoose. Also serves the storefront's static files.
│  └─ src/
│     ├─ controllers/  models/  rutas/  middlewares/  utils/
│     └─ seed/         the original catalogue, and an idempotent seeder
└─ web/     HTML, Bootstrap and plain JavaScript. No framework.

docker-compose.yml   MongoDB + the API
```

**One origin, no CORS.** The API serves the storefront's files as well as the
JSON. That is not convenience: the browser refuses to let a page served from
one origin read a response from another, and the cheap way around that rule is
to weaken the API with permissive headers. The correct way is for there to be
only one origin. There is not a single CORS header in this project.

**Plain JavaScript on the front end, deliberately.** No framework stands
between the code and the DOM. The interesting work here is on the server.

## Running it

**Requirements:** Docker Desktop.

```bash
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
# Generate a JWT_SECRET and paste it into .env — compose refuses to start without one.

docker compose up -d --build
docker compose exec api npm run seed
```

`http://localhost:3001` — the storefront.

The seeder inserts 3 categories and 37 products, and can be run as many times
as you like: every write is an upsert keyed on a unique field, so seeding twice
leaves the database exactly as seeding once.

| Endpoint | |
| --- | --- |
| `GET /api/health` | Health check |
| `GET /api/products` | The catalogue, with each product's category populated |
| `GET /api/products/:name` | One product |
| `POST /api/products` | Create — requires a token |
| `PUT /api/products/:id` · `DELETE /api/products/:id` | Requires a token |
| `GET /api/categories` · `POST /api/categories` | |
| `POST /api/users/create` | Register |
| `POST /api/users/login` | Returns a signed token |
| `GET /api/users/getAll` · `PUT` · `DELETE` | Requires a token |
| `POST /api/orders` | Place an order: identifiers and quantities only — requires a token |
| `GET /api/orders` | The orders of whoever is asking — requires a token |

## What was wrong, and what was done about it

The API came from coursework and had never been exercised end to end. These are
the defects found by reading it, in the order they matter.

**Security**

- `PUT /update/:id` and `DELETE /destroyed/:id` had no authentication at all.
  Anyone who knew a user id could modify or delete that user without
  identifying themselves. Both now require a valid token.
- The JWT secret was the string `"secreto"`, written into two source files. A
  secret in the repository is not a secret: anyone reading the code could sign
  a token and impersonate any user. It now comes from the environment, and the
  server refuses to start without it — a default value would be worse, because
  the application would come up and appear to work.
- Every user response returned the document whole, including the password
  hash, and one handler logged it. Removed at the schema level with a `toJSON`
  transform, so it is gone from every route at once rather than depending on
  each controller to remember.
- The authentication middleware assigned the decoded token to `req.res`
  instead of `req.user`, so it never reached the handlers — and `req.res` is
  Express's own response object. It also passed the whole `Bearer <token>`
  header to the verifier instead of the token.

**Things that did not work**

- **There was no login route.** The function that signs tokens existed and was
  never wired to a path, so the API had authentication and no way to
  authenticate. This is why the middleware defect above had gone unnoticed:
  that code path had never run.
- Login had no `return` after its 400, so an unknown email fell through to
  `compareSync(password, null.password)` — a TypeError, then a second attempt
  to respond.
- `User.findeone` — a typo — meant deleting a user always returned 500.
- The password was re-hashed on every save, not only when it changed, so
  updating any other field locked the user out permanently.
- Product lookup by name had its condition inverted: it returned 400 saying the
  product did not exist when it did, and 200 with `null` when it did not. It
  also read `req.body.name` on a `GET` route, which carries no body.
- `Product.find()` returned 404 for an empty collection. An empty list is a
  correct answer to "give me the products", and a 404 makes the storefront
  treat an empty catalogue as a network failure.
- A product's `category` referenced `"category"` while the model registers as
  `"Category"`, which Mongoose treats as different. Any `populate` would have
  thrown; none existed, which is why the storefront never received a category
  name.
- `users.lenght` — a typo — meant that branch never ran.

**Design and hygiene**

- Routes were `/create`, `/getAll`, `/findOne/:name` — a verb in the path and
  always the same method. That is RPC wearing REST's clothes. The path now
  names a resource and the method says what to do with it.
- `dotenv` was a dev dependency and is used at run time: `npm ci --omit=dev`
  produced a server that could not start.
- `bcrypt` is a native module and pulled in `node-pre-gyp` → `tar`, which
  carried the one critical advisory. Replaced with `bcryptjs`, which is plain
  JavaScript. Together with dropping an unused dev tool and two redundant
  dependencies, this took the tree from 491 packages and 14 advisories to 131
  and none.
- The storefront's cart shared object references with the catalogue: `find`
  returns the object itself, so writing a quantity onto a cart item wrote it
  onto the product in the shop window too.
- **The cart was priced in the browser, and "Buy now" bought nothing.** The
  button emptied the array, wrote the empty cart back and showed a thank-you
  message: no request left the page, no order existed, no stock moved. So the
  editable price in `localStorage` was not exploitable — it only misled the
  person editing their own browser. The design was set up to produce the bug
  the moment anyone connected the checkout, because the cart carried the price
  and the obvious next step is to post the cart as it stands. The checkout was
  built the other way round instead: the browser keeps `{ id, cantidad }`, and
  the server looks up what anything costs.
- The cart's total read `$3000` in the markup before anything had been
  calculated — a placeholder that looked like a figure.

## Known limitations

- **There are no automated tests.** Every defect above was found by reading,
  not by a failing test, which is exactly the argument for having them.
- **Prices are floating-point numbers in the catalogue.** The order computes
  in integer cents so a total does not drift — `1299.99 × 3` is `3899.97`, not
  `3899.9700000000003` — but the stored price is still a float. Storing cents
  as integers in the first place is a migration of the catalogue and has not
  been done.
- **Decrementing stock is a compensating rollback, not a transaction.**
  MongoDB offers transactions only on a replica set, and `docker-compose`
  brings up a single instance. Each line is decremented on its own and the
  ones already done are put back if a later one fails. Between the decrement
  and the rollback the stock is briefly wrong, and if the process dies in
  between it stays wrong. The condition on the update (`quantity: { $gte: n }`)
  *is* atomic, so two simultaneous buyers of the last unit cannot both win.
- **The session token lives in `localStorage`.** Any script that manages to run
  on the page can read it. The right place is an `httpOnly` cookie, which
  JavaScript cannot read — that changes how the API hands the token out, not
  just where the browser keeps it.
- **Registration asks for an age and a degree programme.** Both are required by
  the user model, which comes from a university exercise. A shoe shop has no
  business asking either.
- **Nothing is charged.** An order is recorded and the stock comes down. There
  is no payment of any kind.
- **Product images are files in the repository**, not uploads. There is no
  upload flow and no object storage.
