// "Import z IKP" - w wersji hackathonowej czyta mock z data/ikp-mock.json.
// Docelowo: integracja z IKP / P1 (patrz roadmapa w CLAUDE.md).
import { db } from './db'
import { now } from './clock'
import { ikpDoctors, ikpMedications } from '../data/seed'

const FAKE_DELAY_MS = 1500

export async function importFromIkp() {
  await new Promise((r) => setTimeout(r, FAKE_DELAY_MS))
  await db.upsertDoctors(ikpDoctors())
  await db.upsertMedications(ikpMedications(now()))
}
