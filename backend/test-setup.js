// Simple test to verify the setup
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend setup is working!' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Backend setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Set up PostgreSQL database');
  console.log('2. Configure .env file with database credentials');
  console.log('3. Run: npm run dev');
  console.log('4. Test API endpoints');
  
  // Close the test server after showing the message
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});
