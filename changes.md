# ProjectBEA Personal Changelog

> **PRIVATE REPOSITORY REMINDER**
>
> This file is an internal engineering log. It is **not intended to be made
> public**. Do not publish it, include it in a public release, or use it as a
> public upstream changelog without first removing private workflow notes,
> local decisions, and reminders.

## Repository workflow and decisions

- `clean-projectBEA` is our personal version of the original ProjectBEA
  repository.
- Changes are developed in a dedicated branch first.
- Completed changes are merged into this repository's `main` branch so the
  full version, including our changes, is available from `main`.
- Upstream pull requests are optional and are decided separately after a
  change has been tested and reviewed.
- Do not create a pull request automatically.
- Preserve unrelated user changes and existing branch history.
- Keep this file private; it records internal decisions and reminders as well
  as user-facing implementation notes.

## AI handoff: read this before changing the repository

This section is intentionally explicit so another AI assistant can continue
the work if this conversation is unavailable. Treat the rest of this file as
the source of truth for decisions already made, not as a suggestion to
re-implement completed work.

### User's goals

- The user wants a customized parallel version of the official ProjectBEA
  repository, not a temporary experiment and not an automatic contribution
  workflow.
- `clean-projectBEA` is where all personal changes are developed, tested,
  documented, and distributed.
- The customized `main` branch must contain the official upstream history plus
  every completed and tested personal change, so people can download one
  complete version from `main`.
- The repository should stay reasonably current with the official project.
  Synchronize upstream deliberately while preserving custom behavior and
  documenting conflicts or decisions.
- The user may later choose individual changes to propose to the official
  ProjectBEA repository. Preparing a branch for that purpose is allowed;
  opening or submitting a pull request is never automatic.
- The user wants the repository history and this private log to preserve why
  decisions were made, how changes were implemented, and what was verified.

### Repository roles

- `upstream` (`https://github.com/emqnuele/projectBEA.git`) is the official
  ProjectBEA repository. Do not push personal work there.
- `origin` (`https://github.com/webglossdev/projectBEA.git`) is the user's
  customized GitHub repository.
- Local and remote `main` are the complete customized distribution branches.
- `feat/voice-messages-stt` is the published feature branch for the Telegram
  and Discord voice-message implementation. It is available at
  `origin/feat/voice-messages-stt` for a possible future upstream pull
  request, but no pull request has been opened.
- The top-level workspace also contains an older `projectBEA` directory and a
  separate root-level `changes.md`. Do not accidentally apply new work to
  that copy when the task concerns the customized repository. The authoritative
  changelog for this repository is `clean-projectBEA/changes.md`.

### Required workflow for every future code change

1. Start in `clean-projectBEA` and inspect `git status`, current branch,
   remotes, and recent history. Preserve unrelated user changes.
2. Fetch upstream before synchronization or new work:
   `git fetch upstream`.
3. Update the customized `main` deliberately by merging
   `upstream/main` when appropriate. Resolve conflicts in favor of the
   intended combined behavior; never discard custom changes merely to make
   the graph linear.
4. Create a dedicated branch from the current `main` before editing. Use a
   descriptive name such as `feat/...`, `fix/...`, `docs/...`, or
   `chore/...`.
5. Investigate existing patterns and tests before adding code. Make precise
   changes, preserve behavior-safe defaults, and avoid unrelated cleanup.
6. Add or update focused regression tests and directly related documentation.
   Update this file with the implementation, decisions, risks, and results.
7. Run the smallest relevant existing checks, then broader checks when the
   change affects shared behavior. At minimum, inspect the diff and run
   applicable Ruff, Pyright, Python, frontend, or bot checks already defined
   by the repository.
8. Commit the tested branch with a descriptive message and the required
   Copilot co-author trailer:
   `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`.
9. Merge the completed branch into local `main` with a merge commit, then
   push `main` to `origin`. Do not leave completed work only on a feature
   branch.
10. If the user asks to preserve a branch for a possible upstream contribution,
    push that feature branch to `origin` too. Do not create a pull request
    unless the user explicitly asks for one.
11. Verify the final `main` ancestry, remote refs, clean working tree, and
    published commit. Record any failed or environment-dependent check rather
    than hiding it.

### Required behavior when continuing this work

- Do not claim a feature is complete based only on a plausible code review;
  verify the actual route, message path, tests, and published branch.
- Do not reset, force-delete, rebase away, or overwrite user work. Never use
  destructive commands such as `git reset --hard` or `git checkout --` unless
  the user explicitly authorizes that exact action.
- Do not commit secrets, API keys, bot tokens, private URLs, local model
  credentials, generated artifacts, or machine-specific files.
- Do not weaken timing benchmarks or skip failing tests just to obtain a green
  result. Distinguish code failures from resource- or machine-dependent
  failures and document both.
- Do not add dependencies, tooling, or tests outside the repository's
  established ecosystem unless the user explicitly requests it or a real
  missing-dependency failure requires it.
- Surface errors explicitly. Avoid broad exception handling, silent fallbacks,
  and success-shaped responses for invalid input.
- Keep `changes.md` private. It is a continuity and decision log, not public
  release documentation.

### Completed implementation summary

- Configurable LLM provider support was expanded with Google AI Studio,
  generic OpenAI-compatible, local/Ollama/LM Studio, Claude, and generic
  Anthropic-compatible providers, including aliases, model pools, optional
  local/proxy keys, setup/CLI/doctor/configuration support, web settings,
  documentation, and tests.
- Full settings saves were fixed so an unchanged `persona` value echoed from
  `GET /config` is accepted while actual persona edits remain owned by the
  dedicated persona endpoint. Frontend payload cleanup, regression tests, and
  a frontend rebuild were included.
- Repository hygiene was added for local/generated files and secret handling.
- Discord audio attachments in text channels now pass through the bot,
  `POST /discord/voice-message`, the shared STT backend, and the normal scoped
  Discord conversation path.
- Telegram voice notes now count as explicit conversation turns in groups and
  use the shared STT backend.
- Groq Whisper (`whisper-large-v3-turbo`) is the default hosted STT provider;
  local `faster_whisper` remains available for offline/private transcription.
- Ordinary Discord text messages still require a mention, reply, or DM;
  audio attachments are intentional turns without that requirement.
- Voice transcription failures leave a visible voice-message perception
  instead of silently dropping the user's message.

### Current known state and next decisions

- Voice implementation commit: `91f8ce8`.
- Voice implementation branch: `feat/voice-messages-stt`, published to
  `origin/feat/voice-messages-stt`.
- CI recovery commit: `f37e7e7`; merged into `main` as `3bdfcda`.
- Complete changelog commit: `f534071`; merged into `main` as `a093d43`.
- Voice branch publication record commit: `1a937e7`; merged into `main` as
  `cc2f358`.
- The last verified local full suite passed with `1989 passed, 3 skipped`;
  Ruff and Pyright passed. A separate `BEA_PERF=off` run had one
  machine-sensitive avatar timing failure and must not be misreported as a
  voice-message regression.
- Before more feature work, check whether `upstream/main` has advanced,
  synchronize if needed, and record the resulting ahead/behind state here.
- Future upstream pull-request candidates should be reviewed individually;
  the voice branch is the first explicitly preserved candidate.

## 2026-09-14 — Voice messages and speech-to-text

### Added

- Discord audio attachments in text channels are now detected by the Discord
  bot, downloaded, and sent to the Python brain.
- Added `POST /discord/voice-message` to receive an audio attachment,
  transcribe it, and route the result into the normal Discord conversation
  flow.
- Telegram voice notes now count as explicitly addressed messages, including
  in group chats where the transcription does not contain Bea's name.
- The existing shared STT abstraction is used for both platforms:
  - `groq` for hosted Whisper transcription.
  - `faster_whisper` for local transcription with no audio leaving the
    machine.
- Added a regression test proving that a Discord audio attachment is
  transcribed and deposited as a perception.
- Updated the Discord and Telegram skill documentation.

### Decisions

- Groq Whisper is the default STT provider because it is fast and already
  supported by the project.
- Local `faster_whisper` remains available for privacy and offline use.
- Audio messages are treated as intentional turns. Ordinary text in a busy
  Discord channel still requires a mention, reply, or DM.
- A failed transcription still produces a `[voice message]` perception rather
  than silently dropping the user's message.
- Discord audio attachments use the same conversation and response path as
  text, so replies retain channel, author, and message context.

### Configuration

For hosted transcription:

```json
{
  "stt_provider": "groq",
  "stt_model": "whisper-large-v3-turbo"
}
```

Set `GROQ_API_KEY` in the private `.env` file.

For local transcription:

```json
{
  "stt_provider": "faster_whisper",
  "stt_model": "small"
}
```

### Verification

- Targeted Telegram and voice API tests pass.
- Ruff checks pass for changed Python files.
- Discord message-handler JavaScript syntax check passes.

## 2026-09-13 — Repository hygiene

- Local artifacts and generated files were excluded from version control.
- Clean working-file expectations were documented in repository configuration.

## 2026-09-13 — Configurable LLM providers

- Added compatible provider configuration and model pools.
- Added provider alias normalization and failover-safe error handling.
- Added support for additional compatible providers, including local and
  Anthropic-compatible integrations.
- Updated CLI, setup wizard, doctor checks, configuration documentation, web
  settings, model registry, and provider tests.
- Preserved the existing provider behavior as the fallback path.

## Historical reminders

- Never commit API keys, bot tokens, private URLs, or local model credentials.
- Keep Discord and Telegram tokens in environment variables.
- Run targeted tests and lint checks after each implementation branch.
- Review the diff before merging a branch into `main`.
- Decide explicitly whether an upstream pull request is worthwhile; a local
  merge into `main` is the default repository workflow.

## 2026-09-14 — Upstream synchronization policy

- The official ProjectBEA repository is configured as the `upstream` remote:
  `https://github.com/emqnuele/projectBEA.git`.
- `clean-projectBEA/main` is the distribution branch: it contains the latest
  official `upstream/main` history plus our customized commits.
- Before starting new work, fetch the official branch and compare it with
  `main`:

  ```powershell
  git fetch upstream
  git switch main
  git merge upstream/main
  ```

- Resolve any conflicts while preserving intentional custom behavior, run the
  relevant tests, and commit the synchronization merge on `main`.
- New custom work still starts on a dedicated branch, is tested and committed,
  then is merged into local `main`.
- Upstream pull requests remain optional and must never be created
  automatically.
- `main` tracks `upstream/main` for accurate ahead/behind status. This is for
  synchronization visibility; the customized `main` branch remains the
  complete version distributed from this repository.
- On 2026-09-14, after fetching upstream, the repository was 0 commits behind
  and 5 commits ahead of `upstream/main`; no upstream merge was necessary.

## 2026-09-14 — CI route contract

- GitHub Actions exposed a stale endpoint allowlist in
  `tests/test_web_routing.py` after `/discord/voice-message` was added.
- Updated the route contract test so Linux, macOS, Windows, and
  `BEA_PERF=off` CI jobs validate the complete API again.

## 2026-09-14 — CI recovery and verification

### Failure analysis

- The first CI run for the synchronized `main` branch failed because
  `tests/test_web_routing.py::test_every_endpoint_is_registered` still
  expected the pre-voice-message route set.
- The same missing `/discord/voice-message` entry caused the platform test
  jobs and the `BEA_PERF=off` job to fail. The Discord bot tests and docs-site
  workflow were independent of this failure.
- The first local Pyright run also reported ten type errors in the
  Anthropic-compatible client and provider factory. These were fixed without
  changing runtime behavior:
  - narrowed API responses to the dictionaries consumed by the client;
  - decoded byte SSE lines before string operations;
  - guarded the optional streaming callback;
  - normalized an absent provider key to an explicit empty string before
    provider construction.

### Verification

- `uv run --group dev ruff check src tests`: passed.
- `uvx pyright`: passed with 0 errors, warnings, or informations.
- Full Python suite: `1989 passed, 3 skipped`.
- Focused routing, voice API, and avatar tests: `29 passed`.
- `git diff --check`: passed.
- A local `BEA_PERF=off` run completed all tests except the existing
  machine-sensitive avatar envelope benchmark
  (`364.3 ms`, threshold `25.0 ms`). The benchmark was not weakened or
  changed to hide an environment-dependent timing result.

### Commits and publication

- The CI fix was developed on `fix/ci-voice-route`, committed as `f37e7e7`,
  and merged into `main` as `3bdfcda`.
- The corrected customized `main` branch was pushed to `origin`.
- No pull request was created for the official ProjectBEA repository.

## 2026-09-14 — Upstream synchronization after accepted pull request

- Fetched the official `upstream/main` after the user's repository-hygiene
  pull request was accepted upstream.
- The official branch was three commits ahead of the customized `main`:
  - `a75e29f` — repository hygiene changes;
  - `3b80212` — removed the personal `changes.md` ignore rule;
  - `52d9693` — official merge of pull request #21.
- Merged `upstream/main` into `chore/sync-upstream-2026-09-14` and verified
  that the merge was clean.
- The only resulting file change was the upstream addition of `*.pyc` to
  `.gitignore`.
- The custom implementation and private `changes.md` were preserved,
  including the Discord/Telegram voice-message feature and provider changes.
- The synchronization branch is ready to merge into local `main`; after that,
  publish `main` to `origin` and verify that it is 0 commits behind
  `upstream/main`.

## Complete repository history covered by this log

The following entries summarize the earlier changes that were carried into
`clean-projectBEA` before the voice-message work:

### Configurable LLM providers

- Added configurable provider/model pools and failover-safe provider
  selection, while preserving the existing provider as the fallback path.
- Added Google AI Studio, generic OpenAI-compatible, local/Ollama/LM Studio,
  Claude, and generic Anthropic-compatible provider support with aliases.
- Added the associated configuration, secret handling, setup/CLI, doctor,
  model registry, web settings, documentation, and provider tests.
- Kept local and compatible proxy providers usable without a remote API key.

### Settings save fix

- Fixed full settings saves so the `persona` object returned by `GET /config`
  can be echoed back unchanged without triggering the guarded-field error.
- Kept actual persona changes rejected through `POST /config`; persona edits
  continue to use the dedicated persona endpoint.
- Removed `persona` from the frontend's generic config-save payload.
- Added backend and settings API regression coverage and rebuilt the frontend
  assets.

### Repository hygiene

- Added repository hygiene rules for local artifacts and generated files.
- Kept secrets, tokens, local credentials, private URLs, and generated
  machine-specific files out of version control.

## Branch and synchronization record

- `feat/voice-messages-stt` contained the voice implementation and was
  committed as `91f8ce8`.
- The voice feature branch was published to `origin` as
  `origin/feat/voice-messages-stt` on 2026-09-14 so it can be reviewed and,
  if desired later, used as the starting point for an upstream pull request.
- The feature commit is already an ancestor of `main`; the implementation is
  therefore included in the complete customized distribution branch.
- That work was merged into `main` as `43908a0`.
- `chore/track-upstream-main` documented and configured upstream tracking;
  its documentation commit was `86b8b31`, merged into `main` as `a17a823`.
- `fix/ci-voice-route` contained the CI recovery and was merged into `main` as
  `3bdfcda`.
- The official repository is the `upstream` remote:
  `https://github.com/emqnuele/projectBEA.git`.
- The personal GitHub repository is the `origin` remote:
  `https://github.com/webglossdev/projectBEA.git`.
- `main` is the complete distribution branch: official upstream history plus
  all tested personal customizations.
- The intended workflow for every future change is:
  1. fetch and inspect `upstream/main`;
  2. create a dedicated branch from the current `main`;
  3. implement and test the change on that branch;
  4. commit the branch;
  5. merge the tested branch into local `main`;
  6. push `main` to `origin`;
  7. decide separately whether to propose an upstream pull request.
- Never create an upstream pull request automatically.
- When the GitHub comparison showed `origin/main` as 9 commits ahead and
  14 commits behind, the cause was a stale published `origin/main`, not a
  missing upstream merge. After fetching and verifying history, the
  customized local `main` was published with `--force-with-lease`, resulting
  in 7 commits ahead and 0 commits behind `upstream/main`.
- This repository's `main` tracking `upstream/main` is for synchronization
  visibility; it does not remove or hide our custom commits.

## Standing reminders

- `changes.md` is an internal engineering record and must remain private.
- Do not make this file public, publish it as the upstream changelog, or
  include it in public release material without removing private workflow
  notes, local decisions, and reminders.
- Update this file for every implementation, decision, synchronization,
  verification result, and workflow exception.
- Before claiming a change is complete, verify both the code and the
  published `main` branch.
