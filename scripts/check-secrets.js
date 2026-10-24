/**
 * Local Pre-Commit Secret Shield
 * Scans git staged changes for accidentally committed credentials and API keys.
 * Fast, cross-platform, zero dependencies.
 */

import { execSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const SECRET_PATTERNS = [
  {
    name: 'Google / Firebase API Key',
    regex: /AIza[0-9A-Za-z-_]{35}/,
  },
  {
    name: 'Private Key Block',
    regex: /-----BEGIN (?:[A-Z0-9_-]+ )?PRIVATE KEY(?: BLOCK)?-----/,
  },
  {
    name: 'Firebase Service Account JSON',
    regex: /"type":\s*"service_account"/,
  },
  {
    name: 'GitHub Token',
    regex: /(?:gh[pousr]_[0-9a-zA-Z]{36,255}|github_pat_[0-9a-zA-Z_]{82})/,
  },
  {
    name: 'Google OAuth Access Token',
    regex: /ya29\.[0-9A-Za-z-_]{20,}/,
  },
  {
    name: 'NPM Access Token',
    regex: /npm_[0-9a-zA-Z]{32,36}/,
  },
  {
    name: 'JSON Web Token (JWT)',
    regex: /eyJ[A-Za-z0-9-_=]{10,}\.eyJ[A-Za-z0-9-_=]{10,}\.[A-Za-z0-9-_.+/=]{10,}/,
  },
  {
    name: 'Slack Webhook URL',
    regex: /https:\/\/hooks\.slack\.com\/services\/T[0-9A-Za-z_]+\/B[0-9A-Za-z_]+\/[0-9A-Za-z_]+/,
  },
  {
    name: 'Discord Webhook URL',
    regex: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[0-9A-Za-z-_]+/,
  },
  {
    name: 'AWS Access Key ID',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
  },
]

const ALLOWLIST_FILES = [
  '.gitleaks.toml',
  'scripts/check-secrets.js',
  'scripts/check-secrets.spec.js',
]

const ALLOWLIST_VALUES = [
  'YOUR_API_KEY',
  'YOUR_PROJECT_ID',
  'YOUR_APP_ID',
  'YOUR_RECAPTCHA_V3_SITE_KEY',
]

/**
 * Parses git diff output and checks added lines for secret patterns.
 * @param {string} diffText
 * @returns {Array<{ file: string, line: string, patternName: string, snippet: string }>}
 */
export function scanDiff(diffText) {
  const violations = []
  let currentFile = ''

  const lines = diffText.split('\n')
  for (const line of lines) {
    if (line.startsWith('+++ b/')) {
      currentFile = line.substring(6).trim()
      continue
    }

    if (!line.startsWith('+') || line.startsWith('+++')) {
      continue
    }

    if (ALLOWLIST_FILES.some((f) => currentFile.endsWith(f) || currentFile === f)) {
      continue
    }

    const addedContent = line.substring(1)

    if (ALLOWLIST_VALUES.some((val) => addedContent.includes(val))) {
      continue
    }

    for (const pattern of SECRET_PATTERNS) {
      const match = addedContent.match(pattern.regex)
      if (match) {
        const raw = match[0]
        const redacted =
          raw.length > 8 ? `${raw.substring(0, 4)}...${raw.substring(raw.length - 4)}` : '****'

        violations.push({
          file: currentFile,
          line: addedContent.trim(),
          patternName: pattern.name,
          snippet: redacted,
        })
      }
    }
  }

  return violations
}

/**
 * Main execution function.
 */
export function runSecretShield() {
  let diff = ''
  try {
    diff = execSync('git diff --cached --unified=0', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
  } catch {
    process.exit(0)
  }

  if (!diff || diff.trim().length === 0) {
    process.exit(0)
  }

  const violations = scanDiff(diff)

  if (violations.length > 0) {
    console.error('\n' + '='.repeat(70))
    console.error(' [PRE-COMMIT SHIELD] BLOCKED: Potential Secret(s) Detected in Staged Files!')
    console.error('='.repeat(70))
    for (const v of violations) {
      console.error(`\n  File:    ${v.file}`)
      console.error(`  Threat:  ${v.patternName}`)
      console.error(`  Match:   ${v.snippet}`)
      console.error(`  Content: ${v.line.substring(0, 80)}`)
    }
    console.error('\n' + '-'.repeat(70))
    console.error(' To fix this:')
    console.error(' 1. Remove the credential/token from the staged file.')
    console.error(' 2. Use environment variables or add the file to .gitignore.')
    console.error(
      ' 3. If this is a harmless template/mock, add it to ALLOWLIST_FILES in check-secrets.js.',
    )
    console.error('='.repeat(70) + '\n')
    process.exit(1)
  }
}

const isDirectRun =
  process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase()

if (isDirectRun) {
  runSecretShield()
}

export { SECRET_PATTERNS, ALLOWLIST_FILES, ALLOWLIST_VALUES }
