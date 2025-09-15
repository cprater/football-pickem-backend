#!/usr/bin/env node

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { User, League, Team, Game, Pick } = require('../dist/models');
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

// NFL Teams Data (same as existing seed.js)
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

// Fake user data
const fakeUsers = [
  { username: 'admin', email: 'admin@footballpickem.com', firstName: 'Admin', lastName: 'User', password: 'password123' },
  { username: 'john_doe', email: 'john.doe@email.com', firstName: 'John', lastName: 'Doe', password: 'password123' },
  { username: 'jane_smith', email: 'jane.smith@email.com', firstName: 'Jane', lastName: 'Smith', password: 'password123' },
  { username: 'mike_wilson', email: 'mike.wilson@email.com', firstName: 'Mike', lastName: 'Wilson', password: 'password123' },
  { username: 'sarah_jones', email: 'sarah.jones@email.com', firstName: 'Sarah', lastName: 'Jones', password: 'password123' },
  { username: 'david_brown', email: 'david.brown@email.com', firstName: 'David', lastName: 'Brown', password: 'password123' },
  { username: 'lisa_davis', email: 'lisa.davis@email.com', firstName: 'Lisa', lastName: 'Davis', password: 'password123' },
  { username: 'tom_miller', email: 'tom.miller@email.com', firstName: 'Tom', lastName: 'Miller', password: 'password123' },
  { username: 'amy_taylor', email: 'amy.taylor@email.com', firstName: 'Amy', lastName: 'Taylor', password: 'password123' },
  { username: 'chris_anderson', email: 'chris.anderson@email.com', firstName: 'Chris', lastName: 'Anderson', password: 'password123' },
  { username: 'emily_thomas', email: 'emily.thomas@email.com', firstName: 'Emily', lastName: 'Thomas', password: 'password123' },
  { username: 'ryan_moore', email: 'ryan.moore@email.com', firstName: 'Ryan', lastName: 'Moore', password: 'password123' },
  { username: 'jessica_white', email: 'jessica.white@email.com', firstName: 'Jessica', lastName: 'White', password: 'password123' },
  { username: 'matt_harris', email: 'matt.harris@email.com', firstName: 'Matt', lastName: 'Harris', password: 'password123' },
  { username: 'katie_martin', email: 'katie.martin@email.com', firstName: 'Katie', lastName: 'Martin', password: 'password123' }
];

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Get current year for the season
const currentYear = new Date().getFullYear();

// Generate fake games for the season
const generateGames = (teams, seasonYear = currentYear) => {
  const games = [];
  const weeks = 18; // Regular season weeks
  const gamesPerWeek = 16; // 16 games per week (32 teams / 2)
  
  // Create a shuffled copy of teams for each week
  const createWeeklyMatchups = (teams) => {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const matchups = [];
    
    for (let i = 0; i < shuffled.length; i += 2) {
      matchups.push({
        homeTeam: shuffled[i],
        awayTeam: shuffled[i + 1]
      });
    }
    
    return matchups;
  };
  
  // Generate games for each week
  for (let week = 1; week <= weeks; week++) {
    const matchups = createWeeklyMatchups(teams);
    
    matchups.forEach((matchup, index) => {
      // More realistic NFL scheduling
      let gameDate;
      if (week === 1) {
        // Week 1 starts on a Thursday
        gameDate = new Date(seasonYear, 8, 5); // September 5th
        if (index === 0) {
          // First game is Thursday night
          gameDate.setHours(20, 20, 0, 0); // 8:20 PM
        } else {
          // Rest are Sunday
          gameDate.setDate(gameDate.getDate() + 3); // Move to Sunday
          gameDate.setHours(13 + (index % 4) * 2, 0, 0, 0); // 1PM, 3PM, 5PM, 7PM
        }
      } else {
        // Regular weeks start on Thursday
        gameDate = new Date(seasonYear, 8, 5 + (week - 1) * 7); // Thursday of each week
        if (index === 0) {
          // First game is Thursday night
          gameDate.setHours(20, 20, 0, 0); // 8:20 PM
        } else if (index === matchups.length - 1) {
          // Last game is Monday night
          gameDate.setDate(gameDate.getDate() + 4); // Move to Monday
          gameDate.setHours(20, 15, 0, 0); // 8:15 PM
        } else {
          // Rest are Sunday
          gameDate.setDate(gameDate.getDate() + 3); // Move to Sunday
          gameDate.setHours(13 + (index % 4) * 2, 0, 0, 0); // 1PM, 3PM, 5PM, 7PM
        }
      }
      
      // More realistic game status distribution
      let status, homeScore = null, awayScore = null;
      
      if (week <= 6) {
        // Past weeks - all games completed
        status = 'final';
        homeScore = getRandomInt(0, 45);
        awayScore = getRandomInt(0, 45);
      } else if (week === 7) {
        // Current week - mix of completed and in-progress
        const rand = Math.random();
        if (rand < 0.7) {
          status = 'final';
          homeScore = getRandomInt(0, 45);
          awayScore = getRandomInt(0, 45);
        } else if (rand < 0.9) {
          status = 'in_progress';
          homeScore = getRandomInt(0, 35);
          awayScore = getRandomInt(0, 35);
        } else {
          status = 'scheduled';
        }
      } else {
        // Future weeks - mostly scheduled
        status = Math.random() < 0.1 ? 'scheduled' : 'scheduled';
      }
      
      games.push({
        homeTeamId: matchup.homeTeam.id,
        awayTeamId: matchup.awayTeam.id,
        gameDate,
        week,
        seasonYear,
        spread: Math.round((Math.random() - 0.5) * 14 * 2) / 2, // -7 to +7 in 0.5 increments
        overUnder: Math.round((40 + Math.random() * 20) * 2) / 2, // 40-60 points
        status,
        homeScore,
        awayScore,
      });
    });
  }
  
  return games;
};

// Generate fake picks
const generatePicks = (users, leagues, games) => {
  const picks = [];
  const pickTypes = ['straight', 'spread', 'over_under'];
  
  leagues.forEach(league => {
    users.forEach(user => {
      // Generate picks only for past weeks (weeks 1-6)
      const pastWeeks = [1, 2];
      
      pastWeeks.forEach(week => {
        const weekGames = games.filter(game => game.week === week);
        const completedWeekGames = weekGames.filter(game => game.status === 'final');
        
        // Pick 80-95% of completed games from past weeks
        const gamesToPick = completedWeekGames.filter(() => Math.random() > 0.1);
        
        gamesToPick.forEach(game => {
          const pickType = getRandomElement(pickTypes);
          const pickedTeamId = Math.random() > 0.5 ? game.homeTeamId : game.awayTeamId;
          
          // Determine if pick is correct based on actual game results
          let isCorrect = false;
          if (pickType === 'straight') {
            // Straight pick: correct if picked team won
            isCorrect = pickedTeamId === game.homeTeamId ? 
              game.homeScore > game.awayScore : 
              game.awayScore > game.homeScore;
          } else if (pickType === 'spread') {
            // Spread pick: correct if picked team covered
            const spread = game.spread;
            const homeWithSpread = game.homeScore + spread;
            isCorrect = pickedTeamId === game.homeTeamId ? 
              homeWithSpread > game.awayScore : 
              game.awayScore > homeWithSpread;
          } else if (pickType === 'over_under') {
            // Over/under pick: correct if total points hit the bet
            const total = game.homeScore + game.awayScore;
            const overUnder = game.overUnder;
            // Assume user picked "over" 60% of the time
            const pickedOver = Math.random() > 0.4;
            isCorrect = pickedOver ? total > overUnder : total < overUnder;
          }
          
          picks.push({
            userId: user.id,
            leagueId: league.id,
            gameId: game.id,
            pickedTeamId,
            pickType,
            confidencePoints: pickType === 'straight' ? getRandomInt(1, 16) : null,
            isCorrect,
          });
        });
      });
    });
  });
  
  return picks;
};

async function seedWithFakeData() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Clear existing data (in reverse dependency order)
    console.log('🗑️  Clearing existing data...');
    await Pick.destroy({ where: {} });
    await Game.destroy({ where: {} });
    await League.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Team.destroy({ where: {} });
    
    // 1. Insert NFL teams
    console.log('🏈 Inserting NFL teams...');
    const teams = await Team.bulkCreate(nflTeams);
    console.log(`✅ Inserted ${teams.length} NFL teams`);
    
    // 2. Insert fake users
    console.log('👥 Creating fake users...');
    const users = [];
    for (const userData of fakeUsers) {
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: userData.password, // Pass plain password - User model will hash it
        isActive: true,
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} fake users`);
    
    // 3. Create fake leagues
    console.log('🏆 Creating fake leagues...');
    const leagueTemplates = [
      {
        name: 'Championship League',
        description: 'The ultimate test of football knowledge! High stakes, high rewards.',
        isPublic: true,
        maxParticipants: 20,
        entryFee: 50.00,
        scoringType: 'confidence',
        seasonYear: currentYear,
      },
      {
        name: 'Friends & Family',
        description: 'A fun league for friends and family to compete together.',
        isPublic: false,
        maxParticipants: 12,
        entryFee: 10.00,
        scoringType: 'straight',
        seasonYear: currentYear,
      },
      {
        name: 'Survivor Pool',
        description: 'Pick one team each week. If they lose, you\'re out!',
        isPublic: true,
        maxParticipants: 50,
        entryFee: 25.00,
        scoringType: 'survivor',
        seasonYear: currentYear,
      },
      {
        name: 'Confidence Kings',
        description: 'Rank your confidence in each pick for maximum points.',
        isPublic: true,
        maxParticipants: 16,
        entryFee: 30.00,
        scoringType: 'confidence',
        seasonYear: currentYear,
      },
      {
        name: 'No Entry Fee League',
        description: 'Just for fun! No money involved.',
        isPublic: true,
        maxParticipants: 25,
        entryFee: 0.00,
        scoringType: 'straight',
        seasonYear: currentYear,
      }
    ];
    
    const leagues = [];
    for (const leagueData of leagueTemplates) {
      const commissioner = getRandomElement(users);
      const league = await League.create({
        ...leagueData,
        commissionerId: commissioner.id,
        leagueSettings: {
          tiebreaker: 'total_points',
          playoffWeeks: [18, 19, 20, 21],
          allowTies: true,
        },
        isActive: true,
      });
      
      // Add commissioner as participant
      await league.addParticipant(commissioner);
      
      // Add random participants (3-8 additional users)
      const numParticipants = getRandomInt(3, 8);
      const availableUsers = users.filter(u => u.id !== commissioner.id);
      const shuffledUsers = availableUsers.sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < Math.min(numParticipants, shuffledUsers.length); i++) {
        await league.addParticipant(shuffledUsers[i]);
      }
      
      leagues.push(league);
    }
    console.log(`✅ Created ${leagues.length} leagues with participants`);
    
    // 4. Generate fake games
    console.log('⚽ Generating fake games...');
    const games = generateGames(teams, currentYear);
    const createdGames = await Game.bulkCreate(games);
    console.log(`✅ Generated ${createdGames.length} games`);
    
    // 5. Generate fake picks
    console.log('🎯 Creating fake picks...');
    const picks = generatePicks(users, leagues, createdGames);
    await Pick.bulkCreate(picks);
    
    // Log pick statistics
    const completedPicks = picks.filter(pick => pick.isCorrect !== null);
    const correctPicks = completedPicks.filter(pick => pick.isCorrect === true);
    const pickAccuracy = completedPicks.length > 0 ? (correctPicks.length / completedPicks.length * 100).toFixed(1) : 0;
    
    console.log(`✅ Created ${picks.length} picks (past weeks only)`);
    console.log(`📊 Pick Statistics:`);
    console.log(`   - Completed picks: ${completedPicks.length}`);
    console.log(`   - Correct picks: ${correctPicks.length}`);
    console.log(`   - Accuracy: ${pickAccuracy}%`);
    
    // Log picks by week
    const picksByWeek = {};
    picks.forEach(pick => {
      const game = createdGames.find(g => g.id === pick.gameId);
      if (game) {
        picksByWeek[game.week] = (picksByWeek[game.week] || 0) + 1;
      }
    });
    
    console.log(`📅 Picks by week (past weeks only):`);
    Object.keys(picksByWeek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(week => {
      console.log(`   - Week ${week}: ${picksByWeek[week]} picks`);
    });
    
    // 6. Print summary
    console.log('\n📊 Database Seeding Summary:');
    console.log(`   Teams: ${teams.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Leagues: ${leagues.length}`);
    console.log(`   Games: ${createdGames.length}`);
    console.log(`   Picks: ${picks.length}`);
    
    console.log('\n🔑 Test User Credentials:');
    console.log('   Email: admin@footballpickem.com');
    console.log('   Password: password123');
    console.log('   (All users use the same password for testing)');
    
    console.log('\n🎉 Comprehensive seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding
seedWithFakeData();
