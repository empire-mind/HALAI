# Releasing HALAI

For a normal release, run **Actions → Prepare next release → Run workflow** and
choose a patch, minor, or custom version. It opens a tiny version-bump PR;
merging that PR automatically starts **Release** and assembles a draft from the
exact merge commit. Review and publish the draft when it is ready.

The existing **Actions → Release → Run workflow** button remains available for
reruns and recovery. It
builds macOS (arm64 + x64, signed, notarized, stapled), Windows, and Ubuntu
from a single pinned commit, verifies every artifact the way a user would
receive it, and assembles the canonical draft in
[EmpireMind/HALAI releases](https://github.com/empire-mind/HALAI/releases).
Each desktop build verifies that its packaged updater manifest uses that
repository over HTTPS. The release workflow then checks the SHA-256 digest of
every uploaded asset against the staged file.

Leave **publish** unticked to review the draft. Once authorised for release,
publish the canonical draft in GitHub's UI or use the workflow's **publish**
input. The latter dispatches the existing Docker and connector workflows.
HALAI's public npm package requires its own package ownership and trusted
publisher setup.

The release commit must have passed CI on every platform: the **CI passed on
the release commit** job waits (while the platforms build) for a ci.yml run
whose `CI` check passed with every Linux, Windows and macOS shard, on the
pinned commit or a commit with the same tree, and stops the release before any
draft if the commit's CI failed. A push to main runs the Linux shards only, so
unless the release branch's own CI (started by **Prepare next release**) or a
nightly run covered the same tree, the job runs the full CI on the commit
itself on a temporary `release-ci/v<version>` branch, which takes about as
long as the platform builds. After a flaky failure, re-run the failed CI jobs;
a release still waiting picks up the new attempt, and a release that already
stopped needs only `gh run rerun <id> --failed`. `ship_without_ci` skips the
wait, for emergencies only. See [CI job selection](ci.md#main-and-releases).

The workflow refuses to overwrite an already-published version. Manual Release
runs still require `package.json`'s version to be bumped on the selected ref.
A release is rejected if any installer, stable download
name, updater feed, blockmap, size, or digest is absent or inconsistent.

GitHub generates the release body from pull requests since the previous
canonical tag. The HALAI docs changelog reads the first-party release history.
Configure the optional Vercel hook below to rebuild the docs immediately after
publication; otherwise the live cache or the next normal docs deployment
refreshes it.

## Data format and rollback

Each release records the data-folder formats it writes and reads:
**Prepare next release** runs `scripts/record-data-format.mjs`, which writes
`server/data-format-released.json` into the version-bump commit. The next
release's changes are tested against that record, so a version never writes
data the release before it cannot read
([CONTRIBUTING.md, "Changing how data is stored"](../CONTRIBUTING.md#changing-how-data-is-stored)).
A version bump made by hand needs the same command, or
`server/data-format.test.ts` fails on the mismatched version.

## Promote a release to stable

Self-hosted servers do not follow the newest release: they follow `stable`.
A release becomes stable only after our own Clouds have run it for 48 hours.
Then run **Actions → Promote to stable → Run workflow** with the version
(`X.Y.Z`) and tick that the 48 hours are done.

The workflow builds nothing. It:

1. refuses a version that is not a published, full release, or that was
   published less than 48 hours ago (`urgent` skips the wait, for a fix that
   cannot wait);
2. checks that the release's server image has `linux/amd64` and `linux/arm64`,
   and reads its digest and the Cloud home image's;
3. refuses to move stable back to an older version unless `allow_older` is
   ticked;
4. moves the `stable` tag of `ghcr.io/milind-soni/openmausbot` and of
   `ghcr.io/milind-soni/openmausbot-cloud-home` to those digests;
5. commits `stable.json` (version, both images by digest, and every version
   that was stable in the last 90 days) to the `channels` branch. When that
   fails after the tags moved, the tags are put back to the digests the
   published record still names.

It reads the current record before it writes the next one. Only a `channels`
branch that does not exist counts as "no record yet"; any other failure to read
it stops the run, so a network error never skips the move-back check or drops
the history.

Servers read
`https://raw.githubusercontent.com/milind-soni/OpenMausBot/channels/stable.json`:
the update check (`server/update-check.ts`) for the version, and
`deploy/update.sh` for the image to pull. `latest` still follows `main` and is
never moved by this workflow. Running it again with the same version changes
nothing, and repairs a run that stopped between the tag and the record.
Until a first version is promoted, both fall back to the newest release. The
`channels` branch is written only by this workflow; do not edit it by hand.
The checks live in `scripts/stable-channel.mjs`.

### How a server takes an update

One routine, in the two places that can run it. A server cannot replace its
own container, so neither is the server process: a connected server's update
is the connector's `update` job, and a standalone Docker Compose install's is
`deploy/update.sh`, run on the host by its owner. They are two programs (the
connector drives a container it made itself through the Docker API and has no
shell; a Compose install has to be swapped by `docker compose` on the host),
held to the same steps and the same promises:

| Step | Connector (`connector/src/home.ts`) | Standalone (`deploy/update.sh`) |
| --- | --- | --- |
| Image by digest, before anything stops | `ensureImage`, `checkImage` | `docker pull` of the record's `…@sha256:…` |
| Room for the copy | `ensureRoomForCopy` | `room_for_copy` |
| Stop, copy `/data` aside | `stopAndCopy` → volume `mausbot-snapshot` | `stop_server` (checked stopped), `copy_aside` → a new volume `<project>_data-before-update-<time>`, compared with the data file by file; the copy before it is removed only then |
| Never older | the update runner refuses an older image (exit 5) | `older_reason`: by the version the server reports; exit 5 unless `--allow-older` |
| Start the new image | `createContainer`, `startHome` | `OMB_IMAGE` in `.env`, `docker compose up -d` |
| Healthy, and bots can start | signed health report names the image; the bot box still passes every check it passed before | `/api/health` three times running, the version it reports, `openmausbot doctor` if it passed before, Caddy |
| On failure | `rollBack`: old image and the copy, reply `update_rolled_back` | `roll_back`: the copy (into a new folder, checked, then swapped in), `.env` and the old image, exit 1 with the reason; a restore that fails keeps the journal, exit 2 |
| Interrupted | the operation in `home.json`; `recover` at the next start | `.update/journal`; a hangup is ignored, Ctrl-C undoes at once, and the next run keeps a healthy new version or asks before it puts data back |
| Run twice | a job id is answered again, never run again | "already runs …, nothing to do" |

`connector/test/home.test.ts` and `connector/e2e/run.sh` hold the connector to
this; `scripts/testing/deploy-update.test.ts` holds the script to it. A change
to one side's steps belongs in the other too.

## Desktop updater and install identity

New HALAI desktop packages contain `app-update.yml` for the public
`empire-mind/HALAI` feed. Upstream OpenMausBot packages already on a device
follow their packaged updater feed. Qualify an in-place upgrade or a
side-by-side install with the approved signing identity and package IDs
before commissioning an existing device.

## Why the gates exist

Each verification step in `release.yml` maps to a real incident from the
hand-cut releases (0.1.15–0.1.25): stale build output breaking the code
signature, a bare import killing the packaged server on launch while every
check stayed green, helper paths resolving outside the app after bundling,
stapling silently invalidating every published hash, and a finished release
sitting invisible as a draft. Don't remove a gate without reading the comment
above it.

## Bundled browser gates

Desktop builds also stage a pinned engine and Chromium Headless Shell before
packaging. Pre-signing checks validate complete resources and upstream hashes;
native browser smoke tests and macOS signature checks run on the packaged
output. See [browser packaging](browser-packaging.md) for update ownership,
license provenance and Linux sandbox constraints. Missing browser resources
must fail the build, not ship an installer that downloads them on first use.

## One-time setup: release secrets

Set authorised HALAI signing references in **EmpireMind/HALAI → Settings →
Secrets and variables → Actions**.

**Prepare next release** uses the repository's approved Actions permissions
to open a version PR for normal review and merge.

### 1. `MAC_CERT_P12_BASE64` + `MAC_CERT_PASSWORD`

Supply the Developer ID Application certificate approved for HALAI through
the existing signing secret references.

### 2. `APPLE_API_KEY_P8_BASE64` + `APPLE_API_KEY_ID` + `APPLE_API_ISSUER_ID`

Use the approved HALAI App Store Connect notarisation key references.

The canonical release uses the workflow's scoped `GITHUB_TOKEN`.

### 3. Optional `DOCS_DEPLOY_HOOK_URL`

In Vercel, open the docs project and create a **Deploy Hook** for its production
branch. Store that private URL as the `DOCS_DEPLOY_HOOK_URL` repository secret.
Publishing a release then requests a fresh docs deployment so the generated
changelog appears immediately. Do not put the hook URL in source control.

### Local fallback

The hand-cut path still works when Actions is down or a release needs
surgery: `pnpm package:mac`, gate with `codesign --verify --deep --strict`,
notarize with the local keychain profile (`xcrun notarytool submit …
--keychain-profile AC_PASSWORD`), staple, re-zip, regenerate blockmaps and
`node scripts/regenerate-mac-feed.mjs`, verify the updater manifest, and upload
the complete asset set to the HALAI draft. After authorised publication,
download the artefacts and compare their bytes with the published feeds.
