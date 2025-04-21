const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const CoffeeConfigRepository = require('./server/repositories/CoffeeConfigRepository');
const CoffeeConfigService = require('./server/services/CoffeeConfigService');
const coffeeConfigRouter = require('./server/routes/coffeeConfig');

const app = express();
const port = 3001;

// CORS configuration
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Database setup
const db = new sqlite3.Database('./coffee.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

// Create tables
function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS coffee_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    blend TEXT NOT NULL,
    coffee_weight REAL,
    grind_size INTEGER,
    grind_time INTEGER,
    water_temp INTEGER,
    brew_time INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

// Initialize services
const repository = new CoffeeConfigRepository(db);
const service = new CoffeeConfigService(repository);

// Routes
app.use('/api/configs', coffeeConfigRouter(service));

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
}); 