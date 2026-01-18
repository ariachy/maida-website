/**
 * Setup Script: Create Primary Admin User
 * 
 * Run this script once to create the initial super admin account.
 * Usage: npx ts-node scripts/setup-admin.ts
 * 
 * Or add to package.json:
 * "setup-admin": "ts-node scripts/setup-admin.ts"
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionHidden(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    let password = '';
    
    const onData = (char: string) => {
      // Handle special characters
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          stdin.setRawMode(wasRaw);
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit();
          break;
        case '\u007F': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(prompt + '*'.repeat(password.length));
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
      }
    };
    
    stdin.on('data', onData);
  });
}

async function main() {
  console.log('\n🍽️  Maída Admin Setup\n');
  console.log('This script will create the primary admin account.\n');

  // Check if primary admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { isPrimary: true },
  });

  if (existingAdmin) {
    console.log('⚠️  A primary admin already exists:');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Name: ${existingAdmin.name || 'Not set'}`);
    console.log('\nTo create a new primary admin, first delete the existing one.');
    rl.close();
    await prisma.$disconnect();
    return;
  }

  // Gather information
  const email = await question('Email: ');
  
  if (!email || !email.includes('@')) {
    console.log('❌ Invalid email address');
    rl.close();
    await prisma.$disconnect();
    return;
  }

  const name = await question('Name (optional): ');
  
  const password = await questionHidden('Password (min 8 characters): ');
  
  if (password.length < 8) {
    console.log('❌ Password must be at least 8 characters');
    rl.close();
    await prisma.$disconnect();
    return;
  }

  const confirmPassword = await questionHidden('Confirm password: ');
  
  if (password !== confirmPassword) {
    console.log('❌ Passwords do not match');
    rl.close();
    await prisma.$disconnect();
    return;
  }

  // Create admin
  console.log('\nCreating admin account...');
  
  const passwordHash = await bcrypt.hash(password, 12);
  
  const admin = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: name || null,
      passwordHash,
      isPrimary: true,
    },
  });

  console.log('\n✅ Primary admin created successfully!');
  console.log(`   ID: ${admin.id}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name: ${admin.name || 'Not set'}`);
  console.log('\nYou can now log in at /admin');

  rl.close();
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error:', error);
  rl.close();
  prisma.$disconnect();
  process.exit(1);
});
