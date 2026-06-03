# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Jekyll site for the Zamanian Lab (Dept. of Pathobiological Sciences, UW–Madison), based on the `al-folio` academic template and hosted on GitHub Pages at `zamanianlab.github.io` (CNAME → custom domain). Production builds run in GitHub Actions; the `master` branch is the source of truth and pushes to it auto-deploy via `.github/workflows/deploy.yml` (Ruby 3.4.1, `JEKYLL_ENV=production`, `bundle exec jekyll build`, then `JamesIves/github-pages-deploy-action`).

## Local development

Two equivalent paths:

- **Docker (recommended, matches CI more closely):** `docker compose up` — builds the image from `Dockerfile` (Ubuntu 22.04 + Ruby + ImageMagick), serves at http://localhost:4000 with `--livereload`. The container deletes `Gemfile.lock` and re-resolves on every start.
- **Native Ruby:** `bundle install` then `bundle exec jekyll serve --livereload`. Requires Ruby + ImageMagick locally.

There are no tests, linters, or JS build step — Jekyll compiles SCSS and Liquid directly. To verify a change, build and view in browser; check `_site/` if you need to inspect the rendered output.

## Architecture

Standard Jekyll layout with a few non-obvious pieces:

- **`_data/papers.bib`** is the publication source of truth, rendered via `jekyll-scholar` (configured under `scholar:` in `_config.yml`). Pages call `{% bibliography %}` (see `_pages/publications.md`) and `_layouts/papers.html` formats each entry. Bibtex keys listed in `filtered_bibtex_keywords` (`_config.yml`) are stripped from the rendered "BibTeX" popup by `_plugins/hideCustomBibtex.rb` — add a new keyword there if you introduce a custom bib field that shouldn't be shown.
- **`_data/people.yml`** drives `/people/` via `_layouts/people.html`, which dispatches on each entry's `type` (`time_table`, `list`, `map`, `nested_list`, `list_groups`) to a partial under `_includes/people/`. Most lab members use `time_table`; portraits live in `assets/img/people/`.
- **`_data/news.yml`** is the homepage "Lab News" feed (rendered inline in `_pages/about.md`). Entries are plain `date` + `text` (HTML allowed); order in the file controls display order.
- **`_pages/album.md`** auto-generates the gallery from `assets/img/gallery/*` at build time using `site.static_files`. **Filename convention matters:** the leading token before the first `_` is used as the year badge (e.g. `2024_retreat.jpg` → badge "2024"), and `album_icon.png` is filtered out because it's the album entry-point icon on the homepage. Add new photos by dropping files into `assets/img/gallery/` with that prefix.
- **`_plugins/cache-bust.rb`** registers the `bust_css_cache` / `bust_file_cache` Liquid filters used in `_includes/head.html` to append an MD5 query string to `main.css` so browsers pick up SCSS changes. If you add a new long-lived asset reference, consider piping it through one of these filters.
- **`_plugins/file-exists.rb`** registers a `{% file_exists path %}` tag used by some templates to conditionally render optional assets (e.g. portraits, PDFs). Returns the string `"true"`/`"false"`.
- **Styling:** `assets/css/main.scss` is the single SCSS entry point and `@import`s the partials under `_sass/`. There's no PostCSS/webpack — Jekyll's built-in Sass converter handles it.
- **`assets/js/worm-animation.js`** is a self-contained canvas animation tied to `.snake-canvas` / `.logo-scene` in `_pages/about.md`; it respects `prefers-reduced-motion`. Tweak constants at the top of the file (SEG_COUNT, SPEED, BOUNDS_Y, MOLT_FRAMES) rather than restructuring.
- **`assets/pdf_jpg.sh`** is a manual helper (Ghostscript) to generate JPEG previews of publication PDFs into `assets/img/publication_preview/`. Run it from `assets/` when adding new PDFs whose bib entry uses a `preview:` filename.

## Conventions worth knowing

- Pages live in `_pages/` and are exposed because `_config.yml` has `include: ['_pages']`. Each page sets its own `permalink:` in front matter — don't rely on filename-based URLs.
- `_site/`, `.jekyll-cache/`, and `.tweet-cache/` are build artifacts — never edit by hand and don't commit (already in `.gitignore`, but `_site/` may exist locally from previous builds).
- `Gemfile.lock` is committed and used by CI's `bundler-cache`; only the Docker dev flow regenerates it.
- The site is deployed from a build artifact, not from `master` directly — GitHub Pages serves what the workflow pushes (typically to `gh-pages`). Don't expect Pages' built-in Jekyll to run.
