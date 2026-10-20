# GitHub Pages: MagicalBook

The project is prepared for the repository **MagicalBook**. No remote repository,
commit, push or publication was performed during preparation.

## Configuration

- Vite's base is `/MagicalBook/` (case-sensitive).
- Expected public URL: `https://YOUR_USERNAME.github.io/MagicalBook/`.
- `.github/workflows/deploy.yml` runs on pushes to `main` or a manual dispatch.
  It uses Node.js 22, `npm ci`, production compilation, Chromium installation and
  the browser suite. Deployment waits for those checks to pass.
- The workflow uploads **only `dist/`** as the GitHub Pages artifact, then deploys
  it with the GitHub-provided token and Pages/OIDC permissions. No personal token
  or custom deployment secret is required.
- Build output keeps its normal `dist/assets/` layout. Pages serves this artifact
  at `/MagicalBook/`; do not create a nested `dist/MagicalBook/` directory.
- A different repository name or a custom domain requires adjusting Vite's base
  and the explicit browser deployment-path check.

## What goes into GitHub

The repository receives these files when you run `git add .`:

The current exact list is [DEPLOYMENT_FILES.txt](DEPLOYMENT_FILES.txt) (354 files).
It is a snapshot of this folder after applying `.gitignore`; new files you add
later may change that list. `git ls-files` after staging is the final authority.

- `src/`: the unchanged engine, components, effects, styles, artwork and every
  presentation content folder, including authored media stored there.
- `public/`: static public assets and the bundled KaTeX license.
- `tests/`, `playwright.config.ts`: browser validation, including the deployment
  path smoke test.
- `.github/workflows/deploy.yml`, `.gitignore`, `vite.config.ts`, `tsconfig.json`,
  `index.html`, `package.json`, `package-lock.json`.
- `README.md`, `CONTENT_AUTHORING.md`, `AGENTS.md`, `AGENT_TEMPLATE.md`,
  `AGENT_CONTENT_CALC1.md`, and `docs/` including
  authoring guides, QA reports and PNG evidence.

The ignore rules omit dependencies, `dist/`, test reports, recorded test videos,
root-level videos and ZIP backups, `Codex_*.md`, `revisited.md`, temporary files,
local agent state and common secret/credential files. Nothing was deleted.
Videos inside `src/content/` remain eligible for Git; blanket media exclusions
would break future presentations. Ignore rules are a guard, not secret scanning:
review the staged diff before committing. Already tracked secrets would need
separate removal, but this folder did not have a Git repository at preparation.

GitHub Pages visitors receive only the static build artifact, not the source
tree, tests, prompts or project documentation. `dist/` stays ignored in Git because
Actions rebuilds it from the locked source.

## Local verification

```powershell
cd D:\MagicalBook
npm ci
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/MagicalBook/` or
`http://127.0.0.1:4173/MagicalBook/?deck=sample`.

The preview hosts the real production base path. Tests also verify scripts,
stylesheets, local fonts, lazy-loaded content, graph navigation and the public
license under that path. Run `npm test` after installing Chromium with
`npx playwright install chromium` if it is not already installed.

Preparation verification passed:

- `npm run build` (strict TypeScript and Vite production build).
- Nine real Chromium checks: the `/MagicalBook/` deployment smoke test and all
  complete-showcase tests, including content-only decks, formulas, offline use,
  Mini-map, node navigation and closing. No browser console errors were reported.
- Workflow YAML parsing and assertions for triggers, permissions, dependencies,
  build/test/upload order, artifact path and deployment action.
- Real Git ignore checks against 17 exclusion examples and 13 required-file
  examples, including authored content video and documentation. Temporary
  validation metadata was removed; no project Git metadata was modified.
- Generated HTML references `/MagicalBook/assets/`; public license and local
  font/content assets load successfully under the repository path.

## First push — run these yourself

Create an **empty** GitHub repository named `MagicalBook` (without an initial
README, license or gitignore). Replace `YOUR_USERNAME` below with the repository
owner. These commands have not been executed:

```powershell
cd D:\MagicalBook
git init -b main
git add .
git status --short
git diff --cached --stat
git diff --cached
git commit -m "Prepare MagicalBook for GitHub Pages"
git remote add origin https://github.com/YOUR_USERNAME/MagicalBook.git
git push -u origin main
```

Before committing, use `git ls-files` for the exact staged/uploaded file list.
The staged diff should contain no local credentials, old prompts, generated build
output or recordings.

## Enable deployment when ready

In the repository, open **Settings → Pages → Build and deployment → Source →
GitHub Actions**. A push to `main` starts the workflow; if the first run occurred
before Pages was configured, configure it and manually run **Deploy grimoire to
GitHub Pages** from Actions. Successful deployment reports the public URL in the
`github-pages` environment. No deployment can be fully verified remotely until you
create the repository and enable Pages.
