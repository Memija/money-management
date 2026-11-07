import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CSV_FORMAT_SETUPS, generateCsvTestFiles } from './format-test-data-csv.js'
import { generateHtmlTestFiles, HTML_FORMAT_SETUPS } from './format-test-data-html.js'
import { generatePdfTestFiles, PDF_FORMAT_SETUPS } from './format-test-data-pdf.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const testDataDir = path.join(rootDir, 'test-data')

function buildReadmeContent() {
  const csvRows = CSV_FORMAT_SETUPS.map((s) => `| \`csv/${s.id}.csv\` | ${s.title} |`).join('\n')
  const pdfRows = PDF_FORMAT_SETUPS.map((s) => `| \`pdf/${s.id}.pdf\` | ${s.title} |`).join('\n')
  const htmlRows = HTML_FORMAT_SETUPS.map((s) => `| \`html/${s.id}.html\` | ${s.title} |`).join(
    '\n',
  )

  return `# Format-Agnostic Export Test Data Suite

This directory contains **bank-agnostic, structural test fixtures** across **CSV**, **PDF**, and **HTML** formats designed to stress-test Saldio's import parsers against any real-world file layout, delimiter, encoding, date format, sign convention, or DOM structure without tying data to any specific financial institution.

## Directory Structure

\`\`\`text
test-data/
├── csv/    # ${CSV_FORMAT_SETUPS.length} structural CSV & TSV export variations
├── pdf/    # ${PDF_FORMAT_SETUPS.length} structural PDF statement variations
├── html/   # ${HTML_FORMAT_SETUPS.length} structural HTML / copy-paste DOM archetypes (+ index.html)
└── README.md
\`\`\`

## 1. CSV Export Setups (\`test-data/csv/\`)

| File | Structural Variation Tested |
| :--- | :--- |
${csvRows}

## 2. PDF Statement Setups (\`test-data/pdf/\`)

| File | Structural Variation Tested |
| :--- | :--- |
${pdfRows}

## 3. HTML / Web Portal DOM Setups (\`test-data/html/\`)

| File | Structural Variation Tested |
| :--- | :--- |
${htmlRows}

## Regenerating Fixtures & Running Validation

\`\`\`bash
# Regenerate all CSV, PDF, and HTML format fixtures
node scripts/generate-format-test-data.js

# Run the format validation test suites
npx vitest run src/utils/parsers/__tests__/csv-format-setups.test.ts
npx vitest run src/utils/parsers/__tests__/pdf-format-setups.test.ts
npx vitest run src/utils/parsers/__tests__/html-format-setups.test.ts
\`\`\`
`
}

function main() {
  const csvCount = generateCsvTestFiles(path.join(testDataDir, 'csv'))
  const pdfCount = generatePdfTestFiles(path.join(testDataDir, 'pdf'))
  const htmlCount = generateHtmlTestFiles(path.join(testDataDir, 'html'))
  fs.writeFileSync(path.join(testDataDir, 'README.md'), buildReadmeContent(), 'utf-8')
  console.info(
    `Generated ${csvCount} CSV setups, ${pdfCount} PDF setups, and ${htmlCount} HTML setups in test-data/.`,
  )
}

main()
