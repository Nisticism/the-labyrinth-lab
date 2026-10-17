// Interactive CLI: prompt for an admin password, bcrypt-hash it, and write the
// resulting ADMIN_PASSWORD_HASH into .env (creating .env from .env.example if needed).

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bcrypt = require('bcryptjs');

const ENV_PATH = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

function prompt(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (hidden) {
      // Mask input by overwriting each keystroke. Note: not perfectly secure,
      // but adequate for a one-time local script.
      const stdin = process.openStdin();
      process.stdin.on('data', () => {});
      rl.question(question, (answer) => {
        rl.close();
        stdin.pause();
        process.stdout.write('\n');
        resolve(answer);
      });
      rl._writeToOutput = function (str) {
        if (str.includes(question)) rl.output.write(str);
        else rl.output.write('*');
      };
    } else {
      rl.question(question, (answer) => { rl.close(); resolve(answer); });
    }
  });
}

(async () => {
  const pw1 = await prompt('Enter new admin password: ', { hidden: true });
  if (!pw1 || pw1.length < 8) {
    console.error('[ERR] Password must be at least 8 characters.');
    process.exit(1);
  }
  const pw2 = await prompt('Confirm password: ', { hidden: true });
  if (pw1 !== pw2) {
    console.error('[ERR] Passwords do not match.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(pw1, 12);

  let envText = '';
  if (fs.existsSync(ENV_PATH)) {
    envText = fs.readFileSync(ENV_PATH, 'utf8');
  } else if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    envText = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');
    console.log('[INFO] Created .env from .env.example');
  }

  if (/^ADMIN_PASSWORD_HASH=.*/m.test(envText)) {
    envText = envText.replace(/^ADMIN_PASSWORD_HASH=.*/m, `ADMIN_PASSWORD_HASH=${hash}`);
  } else {
    envText += (envText.endsWith('\n') ? '' : '\n') + `ADMIN_PASSWORD_HASH=${hash}\n`;
  }

  fs.writeFileSync(ENV_PATH, envText);
  console.log('[OK] Wrote ADMIN_PASSWORD_HASH to .env');
  console.log('     Keep .env out of version control. Set JWT_SECRET and ADMIN_PATH too.');
})();
