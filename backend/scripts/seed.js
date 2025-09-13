#!/usr/bin/env node

const { Sequelize } = require('sequelize');
const { Team } = require('../dist/models');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'football_pickem',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  dialect: 'postgres',
  logging: false,
});

const nflTeams = [
  // AFC East
  { name: 'Bills', city: 'Buffalo', abbreviation: 'BUF', conference: 'AFC', division: 'East' },
  { name: 'Dolphins', city: 'Miami', abbreviation: 'MIA', conference: 'AFC', division: 'East' },
  { name: 'Patriots', city: 'New England', abbreviation: 'NE', conference: 'AFC', division: 'East' },
  { name: 'Jets', city: 'New York', abbreviation: 'NYJ', conference: 'AFC', division: 'East' },
  
  // AFC North
  { name: 'Ravens', city: 'Baltimore', abbreviation: 'BAL', conference: 'AFC', division: 'North' },
  { name: 'Bengals', city: 'Cincinnati', abbreviation: 'CIN', conference: 'AFC', division: 'North' },
  { name: 'Browns', city: 'Cleveland', abbreviation: 'CLE', conference: 'AFC', division: 'North' },
  { name: 'Steelers', city: 'Pittsburgh', abbreviation: 'PIT', conference: 'AFC', division: 'North' },
  
  // AFC South
  { name: 'Texans', city: 'Houston', abbreviation: 'HOU', conference: 'AFC', division: 'South' },
  { name: 'Colts', city: 'Indianapolis', abbreviation: 'IND', conference: 'AFC', division: 'South' },
  { name: 'Jaguars', city: 'Jacksonville', abbreviation: 'JAX', conference: 'AFC', division: 'South' },
  { name: 'Titans', city: 'Tennessee', abbreviation: 'TEN', conference: 'AFC', division: 'South' },
  
  // AFC West
  { name: 'Broncos', city: 'Denver', abbreviation: 'DEN', conference: 'AFC', division: 'West' },
  { name: 'Chiefs', city: 'Kansas City', abbreviation: 'KC', conference: 'AFC', division: 'West' },
  { name: 'Raiders', city: 'Las Vegas', abbreviation: 'LV', conference: 'AFC', division: 'West' },
  { name: 'Chargers', city: 'Los Angeles', abbreviation: 'LAC', conference: 'AFC', division: 'West' },
  
  // NFC East
  { name: 'Cowboys', city: 'Dallas', abbreviation: 'DAL', conference: 'NFC', division: 'East' },
  { name: 'Giants', city: 'New York', abbreviation: 'NYG', conference: 'NFC', division: 'East' },
  { name: 'Eagles', city: 'Philadelphia', abbreviation: 'PHI', conference: 'NFC', division: 'East' },
  { name: 'Commanders', city: 'Washington', abbreviation: 'WAS', conference: 'NFC', division: 'East' },
  
  // NFC North
  { name: 'Bears', city: 'Chicago', abbreviation: 'CHI', conference: 'NFC', division: 'North' },
  { name: 'Lions', city: 'Detroit', abbreviation: 'DET', conference: 'NFC', division: 'North' },
  { name: 'Packers', city: 'Green Bay', abbreviation: 'GB', conference: 'NFC', division: 'North' },
  { name: 'Vikings', city: 'Minnesota', abbreviation: 'MIN', conference: 'NFC', division: 'North' },
  
  // NFC South
  { name: 'Falcons', city: 'Atlanta', abbreviation: 'ATL', conference: 'NFC', division: 'South' },
  { name: 'Panthers', city: 'Carolina', abbreviation: 'CAR', conference: 'NFC', division: 'South' },
  { name: 'Saints', city: 'New Orleans', abbreviation: 'NO', conference: 'NFC', division: 'South' },
  { name: 'Buccaneers', city: 'Tampa Bay', abbreviation: 'TB', conference: 'NFC', division: 'South' },
  
  // NFC West
  { name: 'Cardinals', city: 'Arizona', abbreviation: 'ARI', conference: 'NFC', division: 'West' },
  { name: 'Rams', city: 'Los Angeles', abbreviation: 'LAR', conference: 'NFC', division: 'West' },
  { name: '49ers', city: 'San Francisco', abbreviation: 'SF', conference: 'NFC', division: 'West' },
  { name: 'Seahawks', city: 'Seattle', abbreviation: 'SEA', conference: 'NFC', division: 'West' }
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Clear existing teams
    await Team.destroy({ where: {} });
    console.log('🗑️  Cleared existing teams');
    
    // Insert NFL teams
    await Team.bulkCreate(nflTeams);
    console.log(`✅ Inserted ${nflTeams.length} NFL teams`);
    
    console.log('🎉 Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
