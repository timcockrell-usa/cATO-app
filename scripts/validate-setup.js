#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

console.log('🔍 cATO Dashboard - Local Development Validation\n');

let hasErrors = false;

// Check 1: Node.js version
console.log('1️⃣ Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} (compatible)`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} (requires 18+)`);
  hasErrors = true;
}

// Check 2: .env.local file exists
console.log('\n2️⃣ Checking environment configuration...');
const envLocalPath = join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('   ✅ .env.local file exists');
  
  // Parse .env.local
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  // Check required Azure variables
  const requiredAzureVars = [
    'VITE_AZURE_CLIENT_ID',
    'VITE_AZURE_AUTHORITY'
  ];

  let azureConfigured = true;
  requiredAzureVars.forEach(varName => {
    if (!envVars[varName] || envVars[varName].includes('your-') || envVars[varName] === '') {
      console.log(`   ❌ ${varName} not properly configured`);
      azureConfigured = false;
      hasErrors = true;
    } else {
      console.log(`   ✅ ${varName} configured`);
    }
  });

  // Validate GUID formats
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (envVars.VITE_AZURE_CLIENT_ID && !envVars.VITE_AZURE_CLIENT_ID.includes('your-')) {
    if (guidRegex.test(envVars.VITE_AZURE_CLIENT_ID)) {
      console.log('   ✅ Client ID format is valid');
    } else {
      console.log('   ❌ Client ID format is invalid (should be a GUID)');
      hasErrors = true;
    }
  }

  if (envVars.VITE_AZURE_AUTHORITY && !envVars.VITE_AZURE_AUTHORITY.includes('your-')) {
    const tenantIdMatch = envVars.VITE_AZURE_AUTHORITY.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
    if (tenantIdMatch) {
      console.log('   ✅ Tenant ID format is valid');
    } else {
      console.log('   ❌ Authority URL format is invalid (should contain tenant GUID)');
      hasErrors = true;
    }
  }

} else {
  console.log('   ❌ .env.local file not found');
  console.log('   💡 Run: Copy-Item .env.local.example .env.local');
  hasErrors = true;
}

// Check 3: package.json dependencies
console.log('\n3️⃣ Checking dependencies...');
const packageJsonPath = join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = [
    '@azure/cosmos',
    '@azure/msal-browser',
    '@azure/msal-react',
    'react',
    'vite'
  ];

  const nodeModulesPath = join(projectRoot, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ node_modules directory exists');
    
    let missingDeps = [];
    requiredDeps.forEach(dep => {
      const depPath = join(nodeModulesPath, dep);
      if (fs.existsSync(depPath)) {
        console.log(`   ✅ ${dep} installed`);
      } else {
        console.log(`   ❌ ${dep} missing`);
        missingDeps.push(dep);
      }
    });

    if (missingDeps.length > 0) {
      console.log('   💡 Run: npm install');
      hasErrors = true;
    }
  } else {
    console.log('   ❌ node_modules not found');
    console.log('   💡 Run: npm install');
    hasErrors = true;
  }
} else {
  console.log('   ❌ package.json not found');
  hasErrors = true;
}

// Check 4: Cosmos DB Emulator (if using localhost)
console.log('\n4️⃣ Checking Cosmos DB Emulator...');
const envLocalExists = fs.existsSync(envLocalPath);
let usingEmulator = false;

if (envLocalExists) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  usingEmulator = envContent.includes('https://localhost:8081');
}

if (usingEmulator) {
  console.log('   🔍 Detected Cosmos DB Emulator configuration');
  
  // Test emulator connection
  const options = {
    hostname: 'localhost',
    port: 8081,
    path: '/',
    method: 'GET',
    timeout: 3000,
    rejectUnauthorized: false // Emulator uses self-signed cert
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 401 || res.statusCode === 200) {
      console.log('   ✅ Cosmos DB Emulator is running');
    } else {
      console.log(`   ❓ Cosmos DB Emulator responded with status ${res.statusCode}`);
    }
  });

  req.on('error', (err) => {
    console.log('   ❌ Cosmos DB Emulator is not running');
    console.log('   💡 Start the Azure Cosmos DB Emulator');
    hasErrors = true;
  });

  req.on('timeout', () => {
    console.log('   ❌ Cosmos DB Emulator connection timeout');
    console.log('   💡 Start the Azure Cosmos DB Emulator');
    hasErrors = true;
  });

  req.end();
} else {
  console.log('   ℹ️  Using Azure Cosmos DB (not local emulator)');
}

// Check 5: Required files
console.log('\n5️⃣ Checking required files...');
const requiredFiles = [
  'src/data/nistControlsEnhanced.ts',
  'src/data/ztaActivitiesEnhanced.ts',
  'src/config/authConfig.ts',
  'src/services/cosmosService.ts'
];

requiredFiles.forEach(file => {
  const filePath = join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
    hasErrors = true;
  }
});

// Summary
console.log('\n📋 Validation Summary');
console.log('='.repeat(50));

if (hasErrors) {
  console.log('❌ Issues found! Please fix the problems above before starting development.');
  console.log('\n🔧 Quick fixes:');
  console.log('   1. Copy .env.local.example to .env.local');
  console.log('   2. Edit .env.local with your Azure App Registration details');
  console.log('   3. Run: npm install');
  console.log('   4. Start Cosmos DB Emulator');
  console.log('   5. Run: npm run migrate-data');
  console.log('   6. Run: npm run dev');
  process.exit(1);
} else {
  console.log('✅ All checks passed! You\'re ready for local development.');
  console.log('\n🚀 Next steps:');
  console.log('   1. npm run migrate-data');
  console.log('   2. npm run dev');
  console.log('   3. Open http://localhost:5173');
}

console.log('\n📖 For detailed setup instructions, see LOCAL_DEVELOPMENT.md');
