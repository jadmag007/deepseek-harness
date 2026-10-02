---
description: "Apelsinka edition brand layer: the orange-slice mark and wordmark in the sidebar, the accent palette over the design-platform tokens, and the appearance tab that switches between palettes."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-apelsinka-brand

English | [中文](README.zh.md)

The owner's language edition of this page is [README.ru.md](README.ru.md).

## Summary

The Apelsinka brand layer gives the edition its own face: an orange-slice mark and the «Апельсинка / Harness» wordmark in the sidebar, an orange accent over the stock design-platform tokens, an outline slice while the agent works, and an Appearance tab beside Chat that switches between four palettes.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

The Appearance tab opens the palette choice. **Stock** leaves the design-platform tokens untouched, **Slice** replaces both the accent and the neutral ladder, **Zest** does the same with gold as the secondary brand color, and **Citrus** — the default — replaces only the accent. The choice is stored per browser under `apelsinka.brand.variant` and applies immediately; it survives reloads and never reaches the session log.

The sidebar mark and wordmark render in the `sidebar.brand.mark` and `sidebar.brand.name` slots, so the shell keeps owning their row, spacing, and New Session behavior.

## Understand the implementation

The palette replaces the design-platform token ladders rather than adding tokens of its own, so every stock surface that reads an alias follows the choice. Two selectors carry the same token block: the stock dark theme declares those tokens on `body[data-ds-dark-theme]`, and an attribute selector counts as a class-level selector, so a block on `html body` (0,0,2) loses to it (0,1,1) and the palette would apply nowhere at all. `html body[data-ds-dark-theme]` (0,1,2) wins.

The tokens live in one `<style>` element on `document.head` rather than in the built stylesheet, because the palette changes at runtime and a static bundle cannot carry four variants. The mark and the name register at priority -1: the stock `ui-brand-official` package claims both slots at the default priority, a second single-slot registration on an occupied priority throws in the browser, and slot entries sort ascending by priority while the cell renders its first live entry.

The package provides no service and declares no Context merge.

## Further Exploration

- [ui-sidebar](../ui-sidebar/README.md) — the sidebar that renders the brand slots and the collapse toggle.
- [ui-conversation](../ui-conversation/README.md) — the conversation surface hosting the view ring the Appearance tab joins.
- [ui-theme](../ui-theme/README.md) — the design-platform tokens this package overrides.

## Model Experience

None, as the package is a browser-side UI plugin layer that registers nothing model-facing.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Working-state silhouette** — the running indicator is a five-sector outline drawn at 14 px, where the sectors merge into a plain disc. A readable silhouette needs the running whale replaced rather than a mask over it; that work is deferred.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

Copy reaches the interface through the `apelsinka-brand` dictionary namespace. The built-in `en` and `zh` dictionaries register through the typed overload; `ru` registers through the namespace overload because the edition's own language is not a built-in locale id.

</details>

**Runtime invariant:** No companion is published. It is a pure-consumer plugin: it emits no Cordis events and owns no mutable cross-plugin state; its slot registrations are plain effects whose disposal the slot ledger's own specs observe directly.