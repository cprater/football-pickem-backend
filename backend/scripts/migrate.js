#!/usr/bin/env node

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Import models to ensure they're registered
require('../dist/models');

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'football_pickem',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  dialect: 'postgres',
  logging: console.log,
});

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync all models (create tables)
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synchronized successfully');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
