#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * This script checks that all required environment variables are set correctly
 * and provides guidance on fixing missing or incorrect values.
 */

require('dotenv').config({ path: '.env.local' });
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

// Define required environment variables
const requiredVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Your Supabase project URL',
    example: 'https://xyz.supabase.co',
    critical: true
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: true
  },
  {
    name: 'NEXT_PUBLIC_REDIRECT_URL',
    description: 'OAuth callback URL',
    example: 'http://localhost:3000/auth/callback',
    critical: true
  },
  {
    name: 'NEXT_PUBLIC_BASE_URL',
    description: 'Base URL of your application',
    example: 'http://localhost:3000',
    critical: false
  },
  {
    name: 'NEXT_PUBLIC_ADMIN_EMAIL',
    description: 'Admin email address',
    example: 'admin@example.com',
    critical: true
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (for admin operations)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: false
  }
];

console.log(chalk.blue('\n🔍 PawMatch Admin Environment Checker\n'));

let missingCritical = false;
let hasWarnings = false;

// Check each required variable
requiredVars.forEach(variable => {
  const value = process.env[variable.name];
  
  if (!value) {
    if (variable.critical) {
      console.log(`${chalk.red('✗')} ${chalk.red(variable.name)}: MISSING - CRITICAL`);
      console.log(`   ${variable.description}`);
      console.log(`   Example: ${variable.example}`);
      missingCritical = true;
    } else {
      console.log(`${chalk.yellow('⚠')} ${chalk.yellow(variable.name)}: MISSING - RECOMMENDED`);
      console.log(`   ${variable.description}`);
      console.log(`   Example: ${variable.example}`);
      hasWarnings = true;
    }
  } else {
    // Show preview of value (truncate for security)
    let preview = '';
    if (variable.name.includes('KEY')) {
      preview = ` - "${value.substring(0, 10)}..."`;
    } else if (variable.name.includes('EMAIL')) {
      const [username, domain] = value.split('@');
      preview = ` - "${username.substring(0, 3)}...@${domain}"`;
    } else {
      preview = ` - "${value}"`;
    }
    console.log(`${chalk.green('✓')} ${chalk.green(variable.name)}${preview}`);
  }
});

console.log('\n');

// Special check for redirect URL configuration
const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;
if (redirectUrl) {
  if (redirectUrl.endsWith('/auth/callback')) {
    console.log(`${chalk.green('✓')} Redirect URL format is correct`);
  } else {
    console.log(`${chalk.yellow('⚠')} Redirect URL should end with "/auth/callback"`);
    hasWarnings = true;
  }
} else {
  // Already reported as missing above
}

// Summary
console.log('\n');
if (missingCritical) {
  console.log(chalk.red('❌ CRITICAL VARIABLES MISSING - Authentication will not work properly'));
  console.log('Please add the missing variables to your .env.local file');
} else if (hasWarnings) {
  console.log(chalk.yellow('⚠️ WARNINGS FOUND - Some functionality may be limited'));
  console.log('Consider adding recommended variables to your .env.local file');
} else {
  console.log(chalk.green('✅ ALL ENVIRONMENT VARIABLES VERIFIED - Configuration looks good!'));
}

console.log('\nTip: Run the update-redirect-urls.js script to ensure redirect URLs are configured in Supabase.');
console.log('     npm run update-redirect-urls\n');
