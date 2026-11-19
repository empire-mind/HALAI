# HALAI by EmpireMind

HALAI is a local-first workspace for your AI team. Create agents for the work you do, organise their conversations and decide which actions need approval.

- [HALAI releases](https://github.com/empire-mind/HALAI/releases)
- [Install from source](apps/docs/content/docs/getting-started/installation.mdx)
- [Architecture and verification](docs/verification/README.md)
- [Release and REA coverage](docs/halai-release.md)

## Run the workspace

Use Node.js 24 or newer, pnpm 10.33.0 and a supported agent CLI. Run the harness and renderer in separate terminals from the same checkout.

```sh
pnpm install --frozen-lockfile
pnpm dev:server
pnpm dev
```

For the Electron development shell, use `pnpm dev:desktop`. The runtime retains its existing configuration and data-directory names. For verification, use the [isolated fixture](docs/verification/README.md) to keep your working data and provider accounts separate.

## Run the website and docs

```sh
pnpm docs:dev
pnpm docs:build
```

The site runs in `apps/docs`. Its home page, workspace demo, rollout brief and documentation share one site origin. Set `HALAI_SITE_ORIGIN` for a hosted deployment. Public indexing requires `HALAI_SITE_INDEXABLE=1` and an HTTPS origin. `HALAI_CONTACT_EMAIL` adds a draft-opening business contact link to the rollout brief.

## Open-source attribution

HALAI builds on the Apache-licensed OpenMausBot core. The original technical reference remains available in [the upstream project](https://github.com/milind-soni/OpenMausBot). See [LICENSE](LICENSE), [NOTICE](NOTICE) and [LICENSING.md](LICENSING.md) for attribution and the optional enterprise licensing boundary.

Create a committed core-only source archive with `node scripts/archive-halai-core.mjs ./HALAI-core.tar.gz`. The archive keeps the source and notices and omits the separately licensed `enterprise/` tree.
