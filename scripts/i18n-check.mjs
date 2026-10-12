// i18n completeness check: every locale must define every English key.
// Usage: npm run i18n:check  (exit 1 on missing keys; extra keys warn only)
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "i18n", "dictionaries");

const keyOf = (src) => {
  const keys = new Set();
  const re = /"([^"]+)":/g;
  let m;
  while ((m = re.exec(src)) !== null) keys.add(m[1]);
  return keys;
};

const files = readdirSync(dir)
  .filter((f) => f.endsWith(".ts"))
  .sort();
if (!files.includes("en.ts")) {
  console.error("i18n-check: en.ts (reference) not found");
  process.exit(2);
}

const reference = keyOf(readFileSync(join(dir, "en.ts"), "utf8"));
let missing = 0;
for (const f of files) {
  if (f === "en.ts") continue;
  const keys = keyOf(readFileSync(join(dir, f), "utf8"));
  const absent = [...reference].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !reference.has(k));
  if (absent.length > 0) {
    missing += absent.length;
    console.log(`${f}: MISSING ${absent.length} key(s): ${absent.join(", ")}`);
  } else {
    console.log(`${f}: complete (${keys.size} keys)`);
  }
  for (const k of extra) console.log(`  note: ${f} has extra key "${k}"`);
}
if (missing > 0) {
  console.error(`i18n-check: ${missing} missing translation(s)`);
  process.exit(1);
}
console.log("i18n-check: all locales complete");
