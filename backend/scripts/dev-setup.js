#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Football Pickem Backend for development...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
    console.log('⚠️  Please update the .env file with your database credentials\n');
  } else {
    console.log('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Check if dist directory exists
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.log('📁 Creating dist directory...');
  fs.mkdirSync(distPath, { recursive: true });
  console.log('✅ dist directory created');
} else {
  console.log('✅ dist directory already exists');
}

console.log('\n🎯 Development setup complete!');
console.log('\nNext steps:');
console.log('1. Update .env file with your database credentials (optional for API docs)');
console.log('2. Run: npm run dev');
console.log('3. Visit: http://localhost:3000/api-docs for API documentation');
console.log('\n💡 Tip: You can run the server without a database to view API documentation');
console.log('   The server will show a warning but still serve the docs and health endpoint.\n');
