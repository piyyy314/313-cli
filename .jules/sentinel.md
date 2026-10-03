## 2025-05-18 - Case-Insensitive Credential Obfuscation
**Vulnerability:** Sensitive CLI option keys (such as `client_secret`, `access_token`, `API_KEY`, or `snyk_token`) passed in non-standard casing (UPPERCASE, camelCase, snake_case) bypassed exact-string checks in `obfuscateArgs` and could leak into analytics and telemetry.
**Learning:** Exact string match checks in parameter sanitization fail when arguments undergo flag transformation or variation across caller boundaries.
**Prevention:** Normalize property keys (lowercasing and stripping `-` and `_` delimiters) when matching against sensitive credential sets to ensure all variations are redacted.
