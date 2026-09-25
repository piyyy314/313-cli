## 2025-05-18 - Sanitizing Debug Request Logs
**Vulnerability:** HTTP request debug logs (`snyk:req` and `snyk` debug namespaces) were dumping raw `payload` headers (including `authorization` tokens, `x-api-key`, `cookie`, `session-token`) and basic auth credentials in proxy URIs into plain text output when debug mode was enabled.
**Learning:** Request options/payload stringification and proxy URI logging in Node HTTP request wrappers must always pass through header/URL sanitizers (`sanitizePayloadForLog` and `sanitizeUrlForLog`) before stringification to avoid leaking live credentials into debug logs or CI build outputs.
**Prevention:** Always sanitize `payload.headers` and proxy URIs using dedicated redaction functions prior to debug or console logging.
