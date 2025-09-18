#!/usr/bin/env node

/**
 * Database Migration Script
 * This script helps migrate data from local MongoDB to Atlas
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import all models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Treatment = require('../models/Treatment');
const TreatmentPlan = require('../models/TreatmentPlan');
const HealthRecord = require('../models/HealthRecord');

class DatabaseMigrator {
  constructor() {
    this.localUri = 'mongodb://localhost:27017/ayursutra';
    this.atlasUri = process.env.MONGODB_ATLAS_URI;
    this.backupDir = path.join(__dirname, '../backups');
  }

  async ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async exportFromLocal() {
    console.log('🔄 Connecting to local MongoDB...');
    await mongoose.connect(this.localUri);
    
    await this.ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const collections = [
      { name: 'users', model: User },
      { name: 'patients', model: Patient },
      { name: 'appointments', model: Appointment },
      { name: 'treatments', model: Treatment },
      { name: 'treatmentplans', model: TreatmentPlan },
      { name: 'healthrecords', model: HealthRecord }
    ];

    const exportData = {};

    for (const collection of collections) {
      try {
        console.log(`📦 Exporting ${collection.name}...`);
        const data = await collection.model.find({}).lean();
        exportData[collection.name] = data;
        console.log(`✅ Exported ${data.length} ${collection.name} records`);
      } catch (error) {
        console.error(`❌ Error exporting ${collection.name}:`, error.message);
        exportData[collection.name] = [];
      }
    }

    const backupFile = path.join(this.backupDir, `ayursutra-backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(exportData, null, 2));
    
    console.log(`💾 Backup saved to: ${backupFile}`);
    await mongoose.disconnect();
    
    return backupFile;
  }

  async importToAtlas(backupFile) {
    if (!this.atlasUri) {
      console.error('❌ MONGODB_ATLAS_URI not found in environment variables');
      console.log('Please add your Atlas connection string to .env file:');
      console.log('MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster0.mongodb.net/ayursutra?retryWrites=true&w=majority');
      return;
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(this.atlasUri);

    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    const collections = [
      { name: 'users', model: User },
      { name: 'patients', model: Patient },
      { name: 'appointments', model: Appointment },
      { name: 'treatments', model: Treatment },
      { name: 'treatmentplans', model: TreatmentPlan },
      { name: 'healthrecords', model: HealthRecord }
    ];

    for (const collection of collections) {
      try {
        const data = backupData[collection.name] || [];
        if (data.length === 0) {
          console.log(`⚠️ No data found for ${collection.name}`);
          continue;
        }

        console.log(`📤 Importing ${data.length} ${collection.name} records...`);
        
        // Clear existing data (optional - remove this if you want to keep existing data)
        // await collection.model.deleteMany({});
        
        // Insert data in batches to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          await collection.model.insertMany(batch, { ordered: false });
        }
        
        console.log(`✅ Successfully imported ${data.length} ${collection.name} records`);
      } catch (error) {
        console.error(`❌ Error importing ${collection.name}:`, error.message);
      }
    }

    await mongoose.disconnect();
    console.log('🎉 Migration completed!');
  }

  async fullMigration() {
    try {
      console.log('🚀 Starting full migration from local to Atlas...');
      const backupFile = await this.exportFromLocal();
      await this.importToAtlas(backupFile);
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
    }
  }
}

// CLI interface
const command = process.argv[2];
const migrator = new DatabaseMigrator();

switch (command) {
  case 'export':
    migrator.exportFromLocal()
      .then(file => console.log(`Export completed: ${file}`))
      .catch(err => console.error('Export failed:', err.message));
    break;
    
  case 'import':
    const backupFile = process.argv[3];
    if (!backupFile) {
      console.error('❌ Please provide backup file path');
      console.log('Usage: node migrate.js import <backup-file-path>');
      process.exit(1);
    }
    migrator.importToAtlas(backupFile)
      .then(() => console.log('Import completed'))
      .catch(err => console.error('Import failed:', err.message));
    break;
    
  case 'full':
    migrator.fullMigration();
    break;
    
  default:
    console.log('📋 Database Migration Tool');
    console.log('Available commands:');
    console.log('  export  - Export data from local MongoDB');
    console.log('  import  - Import data to Atlas (requires backup file)');
    console.log('  full    - Full migration from local to Atlas');
    console.log('');
    console.log('Examples:');
    console.log('  node migrate.js export');
    console.log('  node migrate.js import backups/ayursutra-backup-2023-09-18.json');
    console.log('  node migrate.js full');
}
