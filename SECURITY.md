# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Active  |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email the maintainer directly or use [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability).

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix release**: As soon as practically possible, targeting within 2 weeks for critical issues

### Scope

This policy covers the `create-app` CLI tool itself. Vulnerabilities in generated project templates should be reported separately if they involve dependencies (report upstream) or template logic (report here).

## Security Design

- No `eval`, `new Function`, or dynamic `require()` in source code
- No `postinstall` or `prepare` lifecycle scripts
- Command execution uses explicit argument arrays (`shell: false`) except for npm/npx delegation
- Project names are validated against `/^[a-z0-9]+(-[a-z0-9]+)*$/` before use in any command
- Template paths are derived from `__dirname` + hardcoded names, not user input
- No environment variables, tokens, or secrets are read or stored
