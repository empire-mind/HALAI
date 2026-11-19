# HALAI release and REA coverage

HALAI is an EmpireMind product built on the open-source OpenMausBot runtime. The first-party candidate uses the HALAI repository, branding, website and docs. Work on the candidate starts from accepted HALAI main `f16a8be`.

## Public scope

The reference crawl verified 90 marketing URLs and 50 documentation URLs. This table maps the full inventory into HALAI's product. Site content and the demo use original examples.

| Reference collection | URLs | HALAI equivalent |
| --- | ---: | --- |
| Home, download and public demo | 3 | `/`, `/download`, `/demo`. The demo exercises an approval with sample data. The platform chooser links to the installation guide and HALAI release history. |
| Solutions and guides | 10 | `/solutions` for business workflows and `/guides` for setup, approvals, routines and pairing. |
| Plans, cloud offer, enterprise, partners and contact | 5 | `/pricing`, `/business`, `/contact`. Team size carries through to a rollout brief in the browser. A configured business address enables an email draft. |
| Comparison and alternatives | 27 | `/compare` supplies a reusable evaluation method based on the same task, model and permissions. |
| Editorial and referral content | 41 | `/releases` and `/docs/changelog` for HALAI releases. Publish original editorials as the team produces them. |
| Dedicated hosting hardware | 1 | `/docs/self-hosting` explains the runtime and server options. Hardware sales require an approved first-party offering. |
| Privacy, terms and refunds | 3 | `/privacy` describes the site brief and the workspace data boundary. Contract and refund pages need approved EmpireMind terms before taking payment. |
| Public documentation | 50 | HALAI-branded `/docs` with the full core reference and HALAI installation, changelog and repository links. |

## Runtime coverage

The inherited runtime inventory traces 62 capabilities. Local agents and their engines, conversations, workspaces, routines, approvals, knowledge, provider connections, computing, voice, device pairing and self-hosting remain in the same codebase. The technical reference keeps existing CLI, data and protocol names so operators can use the same entry points while the product adopts its own identity.

The HALAI product default uses its own name and mark. The existing licensed override check still controls optional custom brand files. The source candidate and its archive exclude the separately licensed enterprise tree and retain the original notices. The desktop build uses the HALAI mark and first-party launcher labels. Package identifiers, signing, app store identities and remaining inherited UI artwork need distribution review.

## Business rollout

The first-party site can run from `apps/docs` on an EmpireMind-approved host. Configure the canonical origin and enable indexing on the approved public domain. Set `HALAI_RELEASE_REVISION` from the build checkout and verify the publisher's deployment against `/release.json` before checking delivered pages. A browser can prepare and save a rollout brief with an organisation, team size, hosting choice and pilot task. The configured business address opens a draft for the operator to review.

The bundled runtime requires explicit settings for a managed connector broker or hosted pairing control plane. Its vendor cloud path is an opt-in compatibility path for authorised evaluations. Analytics needs a configured HALAI project key and standalone support reports need `OMB_BUG_REPORT_URL`. HALAI checks its own release history. Self-hosted update runners require an explicit `OMB_SERVER_UPDATE_DIR` for the configured host. First-party checkout, hosted pricing and signed installer receipts are release decisions.

## Cycle 02 gate coverage in HALAI

Reuse the 20-gate scorecard with evidence tied to the HALAI revision and its authorised deployments. The first-party candidate provides a local proof target.

| Gate | HALAI evidence and acceptance |
| --- | --- |
| REA-01 · Sitemap inventory | Generate the sitemap for the 13 site and 50 docs routes. Re-crawl the publisher's live inventory. |
| REA-02 · Pinned revision | Record the exact candidate tree. Match `/release.json` to the publisher's deployment and the approved commit. |
| REA-03 · Capability trace | Map the reference route families above and trace the capabilities that ship in the open-source runtime. |
| REA-04 · Source and hosted boundaries | Identify the core, platform packages, customer integrations and first-party service owners for the release. |
| REA-05 · HTML responses | Verify HTTP 200 and HTML content on every advertised URL in the intended release. |
| REA-06 · Page metadata | Verify titles, descriptions, language and viewport metadata. Enable indexing for the approved public origin at release. |
| REA-07 · Landmarks and images | Check the main landmark, page heading and image attributes on delivered pages. |
| REA-08 · Canonicals | Match every HTML canonical to the route in the HALAI sitemap. Recheck after the authorised docs publish. |
| REA-09 · Fragment targets | Verify first-party skip targets and keyboard movement into main. Recheck the delivered templates and linked fragments. |
| REA-10 · Installer chooser | Open the platform picker by keyboard and verify Escape returns focus to its trigger. |
| REA-11 · Demo decision | Verify the sample release decision has a Denied state and the sample operations workflow can be approved. |
| REA-12 · Team handoff | Verify team size carries from the pricing page to the rollout brief. The staging checkout and entitlement receipt belong to REA-18. |
| REA-13 · Narrow viewport | Check site templates at mobile width and complete the demo and rollout journeys. |
| REA-14 · Build and regression tests | Pin the renderer and server typecheck, production site build and targeted runtime results to the candidate tree. |
| REA-15 · Theme lifecycle | Import, apply, export and remove the HALAI Studio theme in an isolated runtime. |
| REA-16 · Stock contrast | Verify the stock skins and Midnight on desktop and phone on the accepted revision. |
| REA-17 · Agent reply | Re-run the fake-provider fixture and read the completed reply back from the same task. |
| REA-18 · Authorised service and installer journeys | Collect staging receipts for checkout, provider connection, form delivery, native installers and device pairing against the release revision. The loopback pairing and packaged-server fixtures provide engineering QA for their measured paths. |
| REA-19 · Accessibility | Obtain a signed independent WCAG 2.2 AA assessment of the intended release with keyboard, screen reader and complete-process coverage. |
| REA-20 · Evidence replay | Replay the deterministic fixtures. Use Jev output for triage within its measured scope. |

The earlier qualification applies to the reference targets. Record the authorised staging target, publisher and accessibility reviewer for the HALAI release before scoring its production evidence.
