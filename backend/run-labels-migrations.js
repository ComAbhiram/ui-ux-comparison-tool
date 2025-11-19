#!/usr/bin/env node

import runLabelsMigrations from './src/config/labels-migrations.js';

runLabelsMigrations()
  .then(() => {
    console.log('Labels migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Labels migrations failed:', error);
    process.exit(1);
  });