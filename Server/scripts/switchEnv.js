#!/usr/bin/env node

/**
 * Environment Configuration Switcher
 * Helps switch between local and Atlas MongoDB configurations
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

const configurations = {
  local: {
    MONGODB_URI: 'mongodb://localhost:27017/ayursutra',
    NODE_ENV: 'development',
    description: 'Local MongoDB development environment'
  },
  atlas: {
    MONGODB_URI: 'mongodb+srv://username:password@cluster0.mongodb.net/ayursutra?retryWrites=true&w=majority',
    NODE_ENV: 'production',
    description: 'MongoDB Atlas production environment'
  }
};

function readEnvFile() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    return null;
  }
  return fs.readFileSync(envPath, 'utf8');
}

function writeEnvFile(content) {
  fs.writeFileSync(envPath, content);
}

function updateEnvConfig(configType) {
  const config = configurations[configType];
  if (!config) {
    console.error(`❌ Unknown configuration: ${configType}`);
    return;
  }

  let envContent = readEnvFile();
  if (!envContent) return;

  // Update MONGODB_URI
  envContent = envContent.replace(
    /MONGODB_URI=.*/,
    `MONGODB_URI=${config.MONGODB_URI}`
  );

  // Update NODE_ENV
  envContent = envContent.replace(
    /NODE_ENV=.*/,
    `NODE_ENV=${config.NODE_ENV}`
  );

  writeEnvFile(envContent);
  console.log(`✅ Switched to ${config.description}`);
  console.log(`🔗 MongoDB URI: ${config.MONGODB_URI}`);
}

function showCurrentConfig() {
  const envContent = readEnvFile();
  if (!envContent) return;

  const mongoUri = envContent.match(/MONGODB_URI=(.*)/)?.[1];
  const nodeEnv = envContent.match(/NODE_ENV=(.*)/)?.[1];

  console.log('📋 Current Configuration:');
  console.log(`   MongoDB URI: ${mongoUri}`);
  console.log(`   Environment: ${nodeEnv}`);
  
  if (mongoUri?.includes('localhost')) {
    console.log('   🔧 Currently using LOCAL MongoDB');
  } else if (mongoUri?.includes('mongodb.net')) {
    console.log('   ☁️ Currently using MongoDB ATLAS');
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'local':
    updateEnvConfig('local');
    break;
    
  case 'atlas':
    updateEnvConfig('atlas');
    console.log('⚠️ Make sure to update the Atlas URI with your actual credentials!');
    break;
    
  case 'status':
  case 'current':
    showCurrentConfig();
    break;
    
  default:
    console.log('🔧 Environment Configuration Switcher');
    console.log('Available commands:');
    console.log('  local   - Switch to local MongoDB');
    console.log('  atlas   - Switch to MongoDB Atlas');
    console.log('  status  - Show current configuration');
    console.log('');
    console.log('Examples:');
    console.log('  node switchEnv.js local');
    console.log('  node switchEnv.js atlas');
    console.log('  node switchEnv.js status');
}
