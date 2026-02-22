# AGENTS.md

This repo is worked on by both humans and coding agents. These rules exist to keep changes fast **and** retain the ability for humans to understand and write code in the repository.

This subdirectory (`web/`) is a web version of the Python game in the parent directory. You can refer to the Python version as a previous reference implementation, but the web version is now receiving new updates and modifications.

## North Star
- Prefer **clarity and cohesion** over cleverness.
- Ship **small, complete slices** (a feature that works end-to-end), rather than scaffolding.
- Avoid "generated-code vibes": write with minimal ceremony, minimal meta-text, consistent UX copy.

---

## Quickstart (always run before/after changes)
- Install: `npm i`
- Dev: `npm run dev`
- Build and check types: `npm run build`
- Unit tests: `npm run test`
- Format code using `npm run format`
- Check for linter errors using `npm run lint`

---

## Design rules (high leverage)
### 1) Don’t over-abstract
**Default:** write the straightforward code in-place.

Create a helper only when at least one is true:
- It’s used **3+ times** (not "maybe later").
- It captures a **real domain concept** (e.g. "resolveTile", "spawnWave", "formatScore"), not just "doTheThing2".
- It removes a chunk of code that is genuinely distracting from the main flow.

If a helper is used once or twice:
- Prefer a local inline block, or a **small local function inside the module** (not a new file).
- Avoid "utility" files that become junk drawers.

**Anti-patterns**
- "helpers.ts" growing without strong names or ownership.
- A chain of tiny functions that you have to mentally inline to understand.
- Code that requires an LSP to have a hope to navigate it.

### 2) Comments: why > what
Code should explain *what*. Comments should explain:
- **Why** a choice was made (tradeoffs, constraints, gotchas).
- **Non-obvious** domain reasoning (timing quirks, physics approximations, perf constraints).
- **Intentional deviations** from the "obvious" implementation.

Do **not** add comments that restate the code.
Do **not** narrate every step.

**Good comment**
- "We clamp dt to avoid tunnelling on low-FPS machines; gameplay > perfect physics."

**Bad comment**
- "Increment i by 1."

### 3) Human UX copy (no prompt-echoing)
User-facing strings must be written for players/users — not for the prompt.

Rules:
- Never include prompt phrasing like "prototype", "as requested", "turned into a game", "demo", "Codex".
- Avoid hype / AI voice: "seamless", "robust", "cutting-edge", "leverages".
- Prefer short, concrete, consistent language. Keep tone calm, friendly, and matter-of-fact.
- Use consistent terminology (pick one: "Run" vs "Play", "Level" vs "Stage", etc.).

If you introduce UI text:
- Put it in the project’s normal place for strings (and create one if missing, e.g. `src/strings/en.ts`).
- Reuse existing phrases instead of inventing near-duplicates.
- Keep punctuation and casing consistent.

### 4) UX consistency beats novelty
- Match existing spacing, typography, button styles, and interaction patterns.
- Prefer **one** good pattern repeated across screens over bespoke UI per screen.
- If you add a component, make it look like it belongs.

Accessibility basics:
- Don’t rely on color alone to convey meaning.
- Buttons/links should be clearly clickable.
- Keyboard focus should not be broken.

### 5) README and docs should sound human
Documentation should be:
- concise
- task-oriented
- free of salesy language

Avoid the "AI README template voice".
Prefer:
- what it is
- how to run it
- how to build/test
- how to contribute (optional)

---

## TypeScript/Code style expectations
- Keep modules small and purpose-driven.
- Prefer explicit names over cleverness.
- Avoid premature generalization.
- Avoid deep inheritance; prefer simple composition.
- Fail loudly in dev for impossible states (assertions are okay when justified).
- Keep types readable; don’t introduce generic type gymnastics unless it truly pays off.

---

## Change scope + workflow
### Work in small vertical slices
A good change:
- adds/adjusts behaviour
- updates UI copy if needed
- includes tests where practical
- updates docs only when user-facing behaviour changed

Avoid:
- drive-by refactors
- "setup for later"
- large reformatting unrelated to the change

### Before you finish
Run the quickstart checks, then do a self-review:
- Did I add any helpers used <3 times? If yes, inline unless it’s a domain concept.
- Are comments explaining *why*, not narrating?
- Do UI strings sound like a person wrote them?
- Any text that echoes the prompt? Remove it.
- Any inconsistent terminology introduced? Fix it.
- Did I match existing UI patterns?

---

## When uncertain
Prefer the simplest implementation that:
- is easy to read in 30 seconds
- is easy to delete or change later
- matches the repo’s current style

If a tradeoff is unavoidable, leave a **brief "why" comment** and move on.

---

## Output format for agents (when responding in PRs / summaries)
- What changed (1–3 bullets)
- Why (1 bullet)
- Any tradeoffs / follow-ups (optional, max 2 bullets)
- Proposals for improvements and fine-tuning, especially when discussing gameplay concepts

No marketing language.
