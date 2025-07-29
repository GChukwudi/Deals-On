const { initDatabase } = require('../models/database');

console.log('Initializing database...');
initDatabase();

// Give it time to complete
setTimeout(() => {
  console.log('✅ Database initialized successfully!');
  console.log('You can now run: npm run seed');
  process.exit(0);
}, 2000);