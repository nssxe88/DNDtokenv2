import readline from 'readline';
import { v4 as uuidv4 } from 'uuid';
import { initDatabase } from './db/index.js';
import * as queries from './db/queries.js';
import { hashPassword } from './middleware/auth.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log('Admin Setup\n');
  initDatabase();

  if (queries.hasAnyAdminUsers()) {
    console.log('Admin user already exists.');
    rl.close();
    return;
  }

  const username = await ask('Username: ');
  if (!username.trim()) {
    console.log('Username cannot be empty');
    rl.close();
    return;
  }

  const password = await ask('Password (min 8 chars): ');
  if (password.length < 8) {
    console.log('Password too short');
    rl.close();
    return;
  }

  const hash = await hashPassword(password);
  queries.createAdminUser({ id: uuidv4(), username: username.trim(), password_hash: hash });
  console.log(`\nAdmin "${username.trim()}" created successfully.`);
  rl.close();
}

main().catch((e) => {
  console.error(e);
  rl.close();
  process.exit(1);
});
