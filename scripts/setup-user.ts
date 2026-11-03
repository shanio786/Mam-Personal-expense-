/**
 * setup-user.ts — create (or reset) the single user account.
 *
 * Run with:  npx tsx scripts/setup-user.ts
 *
 * Prompts for username, password (hidden), and full name, hashes the password
 * with bcrypt, and writes the one-and-only users row (deleting any existing user
 * first so there is never more than one account).
 *
 * Environment variables are loaded from .env.local in the project root:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as readline from 'node:readline';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const MIN_PASSWORD_LENGTH = 8;

/** Minimal .env parser: loads KEY=VALUE lines into process.env (without overriding existing). */
function loadEnvLocal(): void {
  const path = resolve(process.cwd(), '.env.local');
  let contents: string;
  try {
    contents = readFileSync(path, 'utf8');
  } catch {
    // No .env.local — fall back to whatever is already in the environment.
    return;
  }

  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    // Strip surrounding single or double quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function ask(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((res) => rl.question(query, res));
}

/** Prompt without echoing the typed characters (for passwords). */
function askHidden(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((res) => {
    const rlAny = rl as unknown as {
      stdoutMuted: boolean;
      _writeToOutput: (s: string) => void;
      output: NodeJS.WritableStream;
    };

    const original = rlAny._writeToOutput?.bind(rl);

    process.stdout.write(query);
    rlAny.stdoutMuted = true;
    rlAny._writeToOutput = (s: string) => {
      // While muted, swallow echoed keystrokes (including the typed password).
      if (!rlAny.stdoutMuted && original) original(s);
    };

    rl.question('', (value) => {
      rlAny.stdoutMuted = false;
      if (original) rlAny._writeToOutput = original;
      process.stdout.write('\n');
      res(value);
    });
  });
}

async function main(): Promise<void> {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      '\n✗ Missing Supabase configuration.\n' +
        '  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local\n',
    );
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  try {
    console.log('\nExpense Manager — create the single user account\n');

    // Username
    let username = '';
    while (!username) {
      username = (await ask(rl, 'Username: ')).trim();
      if (!username) console.log('  Username cannot be empty.');
    }

    // Password (with confirmation + min length)
    let password = '';
    for (;;) {
      password = await askHidden(rl, 'Password (min 8 chars): ');
      if (password.length < MIN_PASSWORD_LENGTH) {
        console.log(`  Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        continue;
      }
      const confirm = await askHidden(rl, 'Confirm password: ');
      if (password !== confirm) {
        console.log('  Passwords do not match. Try again.');
        continue;
      }
      break;
    }

    // Full name (optional)
    const fullNameInput = (await ask(rl, 'Full name (optional): ')).trim();
    const fullName = fullNameInput.length > 0 ? fullNameInput : null;

    console.log('\nHashing password and saving user…');

    const passwordHash = await bcrypt.hash(password, 10);

    const supabase = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Single-user app: remove any existing account first, then insert the new one.
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .not('id', 'is', null);
    if (deleteError) {
      console.error('\n✗ Failed to clear existing user:', deleteError.message);
      process.exit(1);
    }

    const { error: insertError } = await supabase.from('users').insert({
      username,
      password_hash: passwordHash,
      full_name: fullName,
    });
    if (insertError) {
      console.error('\n✗ Failed to create user:', insertError.message);
      process.exit(1);
    }

    console.log(`\n✓ User "${username}" created successfully. You can now sign in.\n`);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('\n✗ Unexpected error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
