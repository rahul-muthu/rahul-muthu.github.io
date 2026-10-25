# Rahul Muthu — website version 2

A dependency-free static personal website. The source is plain HTML and CSS in `site/`. There is no framework, client-side JavaScript, analytics, RSS generator, font download, or runtime application.

## Run locally

Node.js 18 or newer is the only requirement.

```bash
npm install
npm run dev
```

Open <http://localhost:4321>. `npm install` installs no packages; it only creates or verifies the lockfile.

## Edit the site

- Edit `site/index.html` for the homepage/About content and identity.
- Edit `site/resume/index.html` for resume details.
- Add an article at `site/blog/article-slug/index.html`, then add its dated link to `site/blog/index.html` and optionally the homepage.
- Edit `site/styles.css` for the shared appearance.
- Replace `site/favicon.svg` if desired.
- Put an optional resume PDF at `site/resume.pdf`.

The small amount of repeated navigation is intentional: it keeps every deployed page independent and avoids a template engine or browser JavaScript.

## Build

```bash
npm run build
```

The build script copies `site/` to `dist/` and checks internal links. Deploy the contents of `dist/` to any static host, including GitHub Pages, Netlify, or Vercel. The production site itself does not need Node.js.

## GitHub Pages

This is version 2 of [rahul-muthu.github.io](https://rahul-muthu.github.io),
with the version 1 history retained in the same repository.

The existing website publishes files from the repository root. Before committing
changes for GitHub Pages, run:

```bash
npm run build:pages
```

This validates the site and copies the built pages and assets into the repository
root, including `.nojekyll`. Commit these generated files together with `site/`.
Edit the source in `site/`, then regenerate; changes to generated files are
overwritten by the next build. To remove a page, remove both its source and its
previously generated root copy.

The `v2` branch holds version 2 for review. Publishing requires merging it into
the branch configured for GitHub Pages (currently `main`).
