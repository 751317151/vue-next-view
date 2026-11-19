import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Guards the environment files that are committed to this repository.
 *
 * `.env` is tracked on purpose — Cloudflare Pages reads it during the build —
 * so anything placed there is public forever. This check exists because that
 * failure mode is silent: nobody notices until the credential leaks, and then
 * rotating it is the only remedy.
 *
 * Credentials belong in a `*.local` file (gitignored) or in the Cloudflare
 * dashboard, both of which override these committed files.
 */
const root = process.cwd();
const committedFiles = ['.env', '.env.development', '.env.production'];

// Files whose contents reach production or CI must never carry a credential.
const mustBeClean = new Set(['.env', '.env.production']);

// Values that are credentials no matter what the variable is called.
const credentialPatterns = [
  { label: 'AWS access key ID', pattern: /AKIA[0-9A-Z]{16}/ },
  { label: 'GitHub token', pattern: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  { label: 'Slack token', pattern: /xox[abpsr]-[A-Za-z0-9-]{10,}/ },
  { label: 'OpenAI-style key', pattern: /sk-[A-Za-z0-9_-]{20,}/ },
  { label: 'private key block', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: 'JSON Web Token', pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];

// A variable name that implies a credential, where any non-empty value counts.
const sensitiveName = /(SECRET|TOKEN|PASSWORD|PASSWD|API[_-]?KEY|PRIVATE[_-]?KEY|ACCESS[_-]?KEY|CRYPTO)/i;

const stripQuotes = (value) => {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && /^(['"]).*\1$/.test(trimmed)) return trimmed.slice(1, -1);
  return trimmed;
};

const parse = (contents) => {
  const entries = [];
  for (const [index, rawLine] of contents.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    entries.push({ line: index + 1, name: line.slice(0, separator).trim(), value: stripQuotes(line.slice(separator + 1)) });
  }
  return entries;
};

const errors = [];
const warnings = [];

for (const file of committedFiles) {
  let contents;
  try {
    contents = await fs.readFile(path.join(root, file), 'utf8');
  } catch {
    continue; // An absent committed env file is not a problem.
  }

  for (const { line, name, value } of parse(contents)) {
    if (!value) continue;

    const matched = credentialPatterns.find((entry) => entry.pattern.test(value));
    if (matched) {
      errors.push(`${file}:${line} ${name} looks like a credential (${matched.label}); move it to a *.local file or the Cloudflare dashboard`);
      continue;
    }

    if (!sensitiveName.test(name)) continue;

    const message = `${file}:${line} ${name} is a credential-shaped variable and ${file} is committed in plain text`;
    if (mustBeClean.has(file)) {
      errors.push(message);
    } else {
      warnings.push(`${message} (local-only file, so this is a warning; never put a real credential here)`);
    }
  }
}

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length) {
  console.error('Environment validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Committed environment files carry no secrets (${committedFiles.length} files checked${warnings.length ? `, ${warnings.length} warning(s)` : ''}).`);
}
