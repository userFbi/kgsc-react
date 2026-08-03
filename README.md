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
public/
  images/               drop gallery photos here as 1.jpg – 6.jpg
```

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
