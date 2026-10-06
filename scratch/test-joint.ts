import { categorize } from '../src/utils/categorizer/categorizer'

const cases = [
  'Anel o. Biljana Memic',
  'ANEL O. BILJANA MEMIC',
  'Anel oder Biljana Memic',
  'Biljana o. Anel Memic',
  'Anel / Biljana Memic',
  'Anel o. Biljana Memic DE12345678901234567890',
  'ANEL O. BILJANA MEMIC GENODEF1S01 DE36550905000003696413 KREDITRATE End-to-End-Ref',
]

for (const c of cases) {
  console.log(`${c} => ${categorize(c)}`)
}
