# Codex project instructions

This repository is for a reusable browser-based **Japanese-anime-inspired magical-grimoire presentation engine** and one first example deck.

Read, in this order:

1. **`AGENT_TEMPLATE.md`** — the authoritative **subject-independent** engine / art direction / interactions / animations / accessibility / architecture contract.
2. **`AGENT_CONTENT_CALC1.md`** — the authoritative **Calculus I-specific** math content / nodes / teaching sequence / interactive demo goals / final scene sequence.
3. **`README.md`** — suggested build steps and quick checks.

**Nonnegotiable separation:** Build the engine reusable for entirely different subjects. All `CALCULUS I` wording, `F0`, `G1`–`G5`, math explanations, ending recap titles, **whether a second-act recap exists, and which slides use parchment-drop** come from **deck data**, never from hardcoded engine branches or styles.

**Art direction:** manuscript parchment and gold-embossed brown leather book; scene-consistent diagrams; multilocus ember/ink propagation, including **concurrent multi-line reveal**; swift but cinematic opening/page turns/closing; reusable optional **per-scene parchment-drop** animation. The falling paper and inscription **overlap**: ignite around two-thirds descent, land while a small portion of the inscription remains unfinished, then let the last ink spread after landing. Any deck may omit the second-act recap entirely.

**Important:** The Math/Calculus deck needs precise content, but it is not the engine's default topic. The engine must also run a sample generic, non-math, graph-free presentation by swapping data only.

**Workflow:** implement a thin end-to-end vertical slice first (cover → open → two pages → page turn → magic reveal → close). Then test multiline simultaneous burning on 3 lines. Then implement optional routes/nodes and demos. Then populate and verify the Calculus I deck. Allow keyboard skip / back / disabled effects / offline use.

No standalone problem-solving mode: the user handles past-exam questions separately on a tablet.
