// create-super-admin.js
// Phase I: Super Admin Initial Bootstrap CLI

import readline from 'node:readline';
import argon2 from 'argon2';
import { pool } from '../config/database.js';

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value || true;
    }
  }
  return args;
}

function prompt(rl, question, hidden = false) {
  return new Promise((resolve) => {
    if (!hidden || !process.stdin.isTTY) {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
      return;
    }

    // Masked password input in TTY
    process.stdout.write(question);
    const stdin = process.stdin;
    const oldRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();

    let password = '';
    const onData = (char) => {
      char = char.toString('utf8');
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': {
          stdin.setRawMode(oldRaw);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password.trim());
          break;
        }
        case '\u0003': {
          // Ctrl+C
          process.exit(1);
          break;
        }
        case '\u0008':
        case '\x7f': {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        }
        default: {
          password += char;
          process.stdout.write('*');
          break;
        }
      }
    };

    stdin.on('data', onData);
  });
}

async function run() {
  const flags = parseArgs();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n======================================================');
  console.log('   Leadora CRM — Super Admin Bootstrap Utility');
  console.log('======================================================\n');

  try {
    let email = flags.email;
    let firstName = flags.firstName;
    let lastName = flags.lastName;
    let password = flags.password;

    if (!email) {
      email = await prompt(rl, 'Enter Super Admin Email: ');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      console.error('❌ Error: A valid email address is required.');
      process.exit(1);
    }

    if (!firstName) {
      firstName = await prompt(rl, 'Enter First Name (Default: Super): ') || 'Super';
    }

    if (!lastName) {
      lastName = await prompt(rl, 'Enter Last Name (Default: Admin): ') || 'Admin';
    }

    if (!password) {
      password = await prompt(rl, 'Enter Password (min 8 characters): ', true);
    }

    if (!password || password.length < 8) {
      console.error('❌ Error: Password must be at least 8 characters long.');
      process.exit(1);
    }

    console.log('\nConnecting to database...');

    // Check if user already exists
    const existingRes = await pool.query(
      'SELECT id, email, role, is_active FROM users WHERE LOWER(email) = LOWER($1);',
      [email],
    );

    const passwordHash = await argon2.hash(password);

    if (existingRes.rows.length > 0) {
      const existingUser = existingRes.rows[0];

      if (existingUser.role !== 'SUPER_ADMIN') {
        console.error(
          `❌ Error: User with email "${email}" already exists with role "${existingUser.role}". Cannot overwrite.`,
        );
        process.exit(1);
      }

      console.log(`ℹ️ Super Admin account with email "${email}" already exists.`);
      let confirmUpdate = flags.password ? 'y' : '';
      if (!confirmUpdate) {
        confirmUpdate = await prompt(
          rl,
          'Do you want to update their password and name? (y/N): ',
        );
      }

      if (confirmUpdate.toLowerCase() === 'y' || confirmUpdate.toLowerCase() === 'yes') {
        await pool.query(
          `UPDATE users 
           SET password_hash = $1, 
               first_name = $2, 
               last_name = $3, 
               is_active = TRUE,
               updated_at = NOW() 
           WHERE id = $4;`,
          [passwordHash, firstName, lastName, existingUser.id],
        );
        console.log(`✅ Success: Super Admin "${email}" credentials updated successfully.`);
      } else {
        console.log('Operation cancelled. No changes made.');
      }
    } else {
      // Create new Super Admin (organization_id is explicitly NULL for platform administrators)
      const insertRes = await pool.query(
        `INSERT INTO users (
           organization_id, 
           first_name, 
           last_name, 
           email, 
           password_hash, 
           role, 
           is_active
         ) 
         VALUES (NULL, $1, $2, $3, $4, 'SUPER_ADMIN', TRUE) 
         RETURNING id, email, first_name, last_name, role;`,
        [firstName, lastName, email.toLowerCase(), passwordHash],
      );

      const created = insertRes.rows[0];
      console.log('✅ Success: Super Admin provisioned successfully!');
      console.log(`   ID:        ${created.id}`);
      console.log(`   Name:      ${created.first_name} ${created.last_name}`);
      console.log(`   Email:     ${created.email}`);
      console.log(`   Role:      ${created.role}`);
      console.log('   Workspace: Platform Root (No demo fixtures created)\n');
    }
  } catch (err) {
    console.error('❌ Fatal error during Super Admin provisioning:', err.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

run();
