# Kamlaba Garden Sport Club — React project

This is a React (Vite) conversion of the original static KGSC HTML pages.

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build
```

## Structure

```
src/
  App.jsx              routes: / , /contact , /location , /login , /author
  main.jsx             React entry point
  index.css            shared design tokens (colors, type, radius) + reset
  components/
    Footer.jsx / .css   shared site footer, used on every page
    Toast.jsx           reusable toast notification
    ScrollToTop.jsx      scrolls to top / #hash on route change
  pages/
    Home.jsx / .css      hero, nav dropdown, about, gallery
    Contact.jsx / .css   booking form (EmailJS) + committee phone numbers
    Location.jsx / .css  embedded map + address card
    Login.jsx / .css     login / signup tabs with client-side validation
    Author.jsx / .css    developer credit card
  manager/
    ManagerLayout.jsx    sidebar + logout, wraps all /manager/* routes
    Dashboard.jsx        stat cards + recently added members
    ViewMembers.jsx      searchable member table with remove action
    AddMember.jsx        validated form that appends to the roster
    Manager.css           shared styles for the manager pages
  data/
    membersStore.js      localStorage-backed mock member records
  admin/
    AdminLayout.jsx / .css   sidebar + logout, wraps all /admin/* routes
    Dashboard.jsx             financial stat cards + recent transactions
    Reports.jsx               totals bar, income/expense filter, transaction table
    AddTransaction.jsx        income/expense toggle + transaction form
    Admin.css                 shared styles for the admin pages
  data/
    membersStore.js      localStorage-backed mock member records
    transactionsStore.js localStorage-backed mock transaction records
public/
  images/               drop gallery photos here as 1.jpg – 6.jpg
```

## Admin portal

Routes under `/admin` (`/admin`, `/admin/reports`, `/admin/add-transaction`)
render inside `AdminLayout` — same sidebar pattern as the manager portal
(Dashboard / Reports / Add Transaction / Logout), same dark-forest sidebar
with the marigold active state, collapsing to a slide-in drawer on mobile.

- **Dashboard** — total income, total expense, net balance, and a count of
  this month's transactions, plus a preview of the 5 most recent
  transactions.
- **Reports** — a totals bar (income / expense / net balance), filter pills
  (All / Income / Expense), search, a paginated transaction table (8 rows
  per page, with Prev/Next and numbered page buttons), and a delete action.
- **Add transaction** — matches the requested layout exactly: an
  Income/Expense toggle sits above the form, then Amount ("Enter the
  transaction amount in INR"), Date ("Select the transaction date"),
  Source/Category — a dropdown of Matki / Lezim / Donation / Other
  ("Choose where this income came from"), and Description. Three actions:
  **Save Transaction** (saves and jumps to Reports), **Save & Add Another**
  (saves and clears the form for the next entry, keeping the same
  type/date), and **Cancel** (returns to the dashboard without saving).
- **Logout** — same as the manager portal: routes back to `/login`, no real
  session to clear yet.

Transaction data lives in `localStorage` (seeded with four sample entries)
alongside the member data, so everything persists across reloads without a
backend — swap `src/data/transactionsStore.js` for real API calls when
you're ready.

Reach the admin portal either by going straight to `/admin`, or through
`/login` with the demo credentials `admin` / `admin`.

## Manager portal

Routes under `/manager` (`/manager`, `/manager/members`, `/manager/add-member`)
render inside `ManagerLayout`, which renders the sidebar (Dashboard / View
Members / Add Member / Logout) from your spec, styled to match the rest of
the site — dark forest sidebar, marigold active state, the same type scale
and card language as the public pages. On mobile the sidebar becomes a
slide-in drawer behind a hamburger button.

- **Dashboard** — total members, new-this-month, and a preview of the five
  most recently added members.
- **View members** — searchable table (name, phone, ID) with **View**,
  **Edit**, and **Delete** actions per row. View opens a read-only modal
  with the member's full details (including the unmasked Aadhar number,
  since that's an admin-only view); the table itself only ever shows the
  Aadhar number masked to its last 4 digits. Edit opens the same modal
  styling as a form, pre-filled, and saves back into the shared store.
- **Add member** — validated form (name, phone, Aadhar, address, T-shirt
  size, shorts size) that writes straight into the shared member list. The
  joining date is no longer a field — it's stamped automatically with
  today's date the moment the member is added.
- **Logout** — clears nothing yet (there's no real session), just routes
  back to `/login`. Wire it to your real auth once that exists.

Member data lives in `localStorage` (seeded with four sample members) so
adding/removing persists across reloads without a backend — swap
`src/data/membersStore.js` for real API calls when you're ready.

You can reach the portal either by going straight to `/manager`, or through
`/login` with the demo credentials `manager` / `manager` (same as the old
`index.html` modal used).


## Notes on the conversion

- Every page from the original static site (`index.html`, `contact.html`,
  `location.html`, `login.html`, `author.html`) is now a route rendered by
  `react-router-dom`, sharing one `<Footer>` component instead of five
  duplicated footers.
- All inline `<script>` DOM logic (nav dropdown open/close, tab switching,
  form validation, the founding-year counter, the EmailJS submit flow) was
  rewritten as React state/handlers — no direct DOM manipulation.
- The Contact page's booking form now uses the `@emailjs/browser` package
  instead of the CDN script tag; the same EmailJS service/template/public
  keys from the original site are wired in (`src/pages/Contact.jsx`).
- Gallery images are referenced as `/images/1.jpg` … `/images/6.jpg` from
  `public/images`; until real photos are added there, each card falls back
  to the soft gradient pattern, exactly like the original.
- The "Access portal" modal (manager/admin login) and its bare
  `admin`/`admin` demo credentials from the old `index.html` were not
  wired to any visible trigger in the source you provided (the button that
  used to open it now opens the nav dropdown instead), so it wasn't carried
  over. The real login/signup flow lives on the `/login` page, matching
  `login.html`. If you want the portal modal back, it's a straightforward
  add — happy to wire it up on request.
- Both forms currently just validate and either `alert(...)` (login/signup)
  or call EmailJS (booking) — same placeholder behavior as the original
  `TODO` comments, ready for you to connect to a real backend.
