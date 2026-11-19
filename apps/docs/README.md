# HALAI website and documentation

The EmpireMind site and its 50 technical docs run in the existing Next.js and Fumadocs app. Marketing routes live in `app/(site)`. The docs source lives in `content/docs`.

## Develop and verify

Run from the repository root with Node.js 24 or newer and the repository's pnpm version.

```bash
pnpm install --frozen-lockfile
pnpm docs:dev
```

Open `http://localhost:3000` for the site and `/docs` for the technical reference.

```bash
pnpm docs:build
pnpm --filter @openmausbot/docs types:check
pnpm --filter @openmausbot/docs lint
```

## Site configuration

Use `apps/docs` as the application root on the authorised EmpireMind publisher. The workspace lockfile and shared product identity live in the repository root. Give the build and runtime the same site origin.

| Variable | Purpose |
| --- | --- |
| `HALAI_SITE_ORIGIN` | Public or staging HTTPS origin for sitemap entries and canonicals. Defaults to `http://127.0.0.1:3000` for local use. |
| `HALAI_SITE_INDEXABLE` | Set to `1` with the approved public HTTPS origin to allow indexing. Preview builds disallow it by default. |
| `HALAI_CONTACT_EMAIL` | Optional public HALAI business address. The rollout brief can open an email draft addressed to it. |
| `HALAI_RELEASE_REVISION` | Full Git commit SHA stamped into `/release.json` at build time. Set it from the checked-out release commit. |
| `GITHUB_RELEASES_TOKEN` | Optional server-side credential for the public HALAI release history, managed through the host's approved secret store. |

The changelog reads published releases from `empire-mind/HALAI` and caches the result for five minutes. If the list is empty or unavailable, the page links to the same release history on GitHub.

Read `/release.json` on the published origin to match the site to its source commit before collecting sitemap, canonical and keyboard evidence.

[HALAI release and REA coverage](../../docs/halai-release.md)
