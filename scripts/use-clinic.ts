/**
 * Swap the active clinic:  `npm run use dermatology-clinic`
 *
 * Copies `content/examples/<name>.json` over `content/clinic.json`, keeping a
 * one-deep backup at `content/clinic.backup.json`. Run with no argument to list
 * what is available.
 */
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const CONTENT_DIR = resolve(process.cwd(), 'content');
const EXAMPLES_DIR = resolve(CONTENT_DIR, 'examples');
const TARGET = resolve(CONTENT_DIR, 'clinic.json');
const BACKUP = resolve(CONTENT_DIR, 'clinic.backup.json');

const available = existsSync(EXAMPLES_DIR)
  ? readdirSync(EXAMPLES_DIR)
      .filter((file) => file.endsWith('.json'))
      .map((file) => basename(file, '.json'))
  : [];

const requested = process.argv[2]?.replace(/\.json$/, '');

if (!requested) {
  console.log('\nUsage: npm run use <name>\n');
  console.log('Available clinics:');
  for (const name of available) console.log(`  • ${name}`);
  console.log('');
  process.exit(available.length > 0 ? 0 : 1);
}

const source = resolve(EXAMPLES_DIR, `${requested}.json`);

if (!existsSync(source)) {
  console.error(`\n✕ No such clinic: ${requested}`);
  console.error(`  Available: ${available.join(', ') || '(none)'}\n`);
  process.exit(1);
}

if (existsSync(TARGET)) copyFileSync(TARGET, BACKUP);
copyFileSync(source, TARGET);

console.log(`\n✓ content/clinic.json is now "${requested}".`);
console.log('  Previous content saved to content/clinic.backup.json');
console.log('  Run `npm run validate` to check it, then `npm run dev`.\n');
