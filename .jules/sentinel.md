## 2025-05-18 - Redact Sensitive CLI Arguments in Driftctl Debug Logs
**Vulnerability:** Unsanitized CLI arguments containing sensitive credentials (`--tfc-token` and `--headers`) were logged in plain text when debug logs were enabled for `driftctl`.
**Learning:** Subprocess execution helper modules and wrappers that pass CLI flags can inadvertently leak credentials via debug logger statements if arguments are logged raw before execution.
**Prevention:** Always sanitize/redact sensitive arguments via a dedicated `sanitizeArgs` helper before passing CLI argument arrays to debug logger calls.
