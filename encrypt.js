// encrypt.js - run this with Node.js to generate encrypted.bin
const crypto = require('crypto');
const fs = require('fs');

const password = 'MySuperSecretKey';
const plaintext = 'This is the secret message!';

const iv = crypto.randomBytes(12);
const salt = iv;

crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
  if (err) throw err;

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const tag = cipher.getAuthTag();

  const encryptedFile = Buffer.concat([iv, encrypted, tag]);

  fs.writeFileSync('encrypted.bin', encryptedFile);
  console.log('Encrypted file created: encrypted.bin');
});
