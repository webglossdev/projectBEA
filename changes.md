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
