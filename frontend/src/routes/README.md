# Routes

TanStack Start uses **file-based routing**. Every `.jsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.jsx`, or
`app/layout.jsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.jsx`.

`routeTree.gen.js` is auto-generated. Don't edit it by hand.

## This project

| File | URL |
| --- | --- |
| `index.jsx` | `/` |
| `register.jsx` | `/register` |
| `success.jsx` | `/success` |
| `find.jsx` | `/find` |
| `leaderboard.jsx` | `/leaderboard` |
| `event-details.jsx` | `/event-details` |
| `competitions.jsx` | `/competitions` |
| `scanner.jsx` | `/scanner` |
| `admin/route.jsx` | `/admin` (login shell) |
| `admin/scanner.jsx` | `/admin/scanner` |
| `admin/register.jsx` | `/admin/register` |
| `admin/registrations.jsx` | `/admin/registrations` |
| `admin/volunteers.jsx` | `/admin/volunteers` |
| `admin/abhishek.jsx` | `/admin/abhishek` |
| `admin/fancy-dress.jsx` | `/admin/fancy-dress` |
| `admin/laddu-gopal.jsx` | `/admin/laddu-gopal` |
| `admin/leaderboard.jsx` | `/admin/leaderboard` |
| `admin/admins.jsx` | `/admin/admins` |

## Conventions

| File | URL |
| --- | --- |
| `index.jsx` | `/` |
| `about.jsx` | `/about` |
| `users/index.jsx` | `/users` |
| `users/$id.jsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.jsx` | `/posts/:category?` (optional segment) |
| `files/$.jsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.jsx` | layout route (renders children via `<Outlet />`) |
| `__root.jsx` | app shell — wraps every page; preserve `<Outlet />` |
