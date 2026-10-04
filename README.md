# Ratul Labs — Md Ratul Islam

Personal portfolio website. Static site: HTML, CSS, vanilla JavaScript and SVG. No build step, no backend, no dependencies (only Google Fonts).

## Files

```
index.html     page structure and all content
style.css      design tokens, layout, animation, responsive rules
script.js      theme, nav, cursor, background, hero animation, radar, projects
config.js      your links and small settings (edit this one)
.nojekyll      tells GitHub Pages to serve files as-is
assets/
  icons/       favicon.svg
  images/      put optimized images here (lazy-load with loading="lazy")
  graphics/    extra SVG graphics
```

## Deploy on GitHub Pages

1. Create a new repository on GitHub (for a user site, name it `your-username.github.io`).
2. Upload everything in this folder to the repository root, including the hidden `.nojekyll` file.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. After a minute the site is live at `https://your-username.github.io/`.

## Add your links (config.js)

Open `config.js` and paste full URLs:

```js
social: {
  github:    "https://github.com/your-username",
  linkedin:  "https://www.linkedin.com/in/your-profile",
  instagram: "https://www.instagram.com/your-handle",
  facebook:  "https://www.facebook.com/your-profile",
  email:     "you@example.com"
}
```

Any value left as `""` stays visible but inactive and dimmed, so the site never points to an address that doesn't exist.

Project pages work the same way. When Nobayon or PassionPath has a public page, set its `url` in `config.js` and a **Visit project** button appears on the card.

## Things worth editing in index.html

- **Project status** (`ACTIVE`, `EXPLORING`) in the metadata of each project card.
- **Research log** statuses (`EXPLORING`, `LEARNING`, `FUTURE`).
- **Technology stack** states. Each module uses `LEARNING`, `EXPLORING` or `USING` (the `s1`, `s2`, `s3` classes control the three-segment indicator).
- **Milestones**. Add exact dates inside the `.ev-meta` line if you want them.

## Features

- Dark and light themes (toggle in the nav, remembered in the browser)
- Animated innovation-system hero with dots travelling along its lines
- Interactive "How I think" stepper and research radar (hover, focus or tap)
- Project cards with hover metadata and expandable details
- Custom cursor on desktop only, disabled on touch devices
- Respects `prefers-reduced-motion`
- Keyboard accessible, with visible focus states, ARIA labels and a skip link

## Local preview

Open `index.html` directly in a browser, or run `python3 -m http.server` in this folder and visit `http://localhost:8000`.
