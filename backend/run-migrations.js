#!/usr/bin/env node

import runMigrations from './src/config/migrations.js';

runMigrations()
  .then(() => {
    console.log('Main migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Main migrations failed:', error);
    process.exit(1);
  });