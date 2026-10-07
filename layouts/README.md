# Log line layouts

**`layout`** — one template for plain `info` / `warn` lines (and for `log.event()` when you do not set `eventLayout`).

**`eventLayout`** — optional **two-line** template for `log.event()` only (identity chip left, JSON on row 2). Preset **`identity-event`** matches the  grid in your screenshot.

## Standard vs event rows

| Row | Formatter | Uses layout for |
| --- | --- | --- |
| **Text** (`info`, `warn`, …) | `formatLayoutSpans` | Level, emoji slot (blank if empty), message, `[module]` |
| **Event** (`log.event`) | `formatBlancEventSpans` | `layout` **or** `eventLayout` — emoji from `_emoji`, name in `%message%` / `%event%`, optional JSON on row 2 |

Rules:

- If the template includes `%emoji%`, **every** row reserves that column (blank on text lines).
- With **`layout` only**, event payload JSON is syntax-colored on row 2, indented under the emoji/message columns (same grid as row 1).
- With **`eventLayout`**, row 1 and row 2 are explicit templates separated by `\n`. Row 2 usually repeats `%identity%` + `%emoji%` so JSON lines up under the event name.
- Rich actor/target rules (two different chips on row 1 vs 2) still belong in `formatRecord` (); meta hooks below cover the common single-chip case.

### Event-only placeholders (`eventLayout`)

| Token | Meaning |
| --- | --- |
| `%identity%` | Fixed-width identity column (`spec.event.identityWidth`). Row 1: chip from `_identity` or `_identityKind` + `_identityBody` (+ optional `_identityTintKey`, `_identityChrome`). Row 2: `_identityRow2*` or a blank column. |
| `%meta%` | Syntax-colored JSON payload (row 2 only; bindings and identity keys stripped) |

Also supported on each row: `%emoji%`, `%event%` / `%message%`, `%level%`, `%module%`.

### `identity-event` preset

```
%identity% %emoji%  %event%
%identity% %emoji%  %meta%
```

```ts
createLogger("gateway", {
  layout: "%level% %emoji%  %message% %module:right%",
  eventLayout: "identity-event",
  symbolMap: { host: "/" },
});

log.event("host.catalog.scheduled", {
  _identityKind: "host",
  _identityBody: "energetic-domehut-y5Yk",
  _identityTintKey: "did:locker:…",
  backfillDelayMs: 600_000,
  entries: 15,
});
```

## Placeholders

| Token | Meaning |
| --- | --- |
| `%level%` | Padded level label (`INFO`, `WARN`, …) |
| `%module%` | `[module]` in a fixed-width column (`spec/const.json` → `moduleWidth`) |
| `%message%` | Log message text (padded when before trailing `%module%`) |
| `%event%` | Alias for `%message%` — same column; useful in event-oriented presets |
| `%emoji%` | Fixed-width emoji slot (`spec.event.emojiWidth`); blank when empty |
| `%module:right%` | Module column, right-aligned within `moduleWidth` |
| `%module:left%` | Module column, left-aligned (default for `%module%`) |

Literal spaces and punctuation in the template are copied into the line.

## Presets

| Id | Template | Description |
| --- | --- | --- |
| `default` | `%level% %emoji%  %message% %module:right%` | Shared grid for text + events (package default) |
| `classic` | `%level% %module% %message%` | Legacy order; no emoji column |

## Examples

```ts
import { createLogger, LOG_LAYOUT_PRESETS } from "@westlane/pino-blanc";

createLogger("api"); // layout: default
createLogger("api", { layout: "classic" });
createLogger("api", { layout: "%level% %emoji%  %event% %module:right%" });

log.info("ready");
log.event("api.ready", { _emoji: "🚀" }); // same columns as above

console.log(LOG_LAYOUT_PRESETS.default.template);
```

Add new presets by adding a file in this folder and registering it in [`index.ts`](index.ts).
