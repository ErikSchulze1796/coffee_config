const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

// Enhanced CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // Disable credentials for Firefox iOS
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Apply CORS before other middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    }
  });
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
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

// Routes
app.get('/api/configs', (req, res) => {
  try {
    console.log('Fetching configurations...');
    db.all('SELECT * FROM coffee_configs', (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
        return;
      }
      console.log(`Found ${rows.length} configurations`);
      res.json(rows);
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.post('/api/configs', (req, res) => {
  try {
    const { brand, blend, coffee_weight, grind_size, grind_time, water_temp, brew_time, notes } = req.body;
    console.log('Received configuration:', req.body);

    if (!brand || !blend) {
      res.status(400).json({ error: 'Brand and blend are required' });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO coffee_configs 
      (brand, blend, coffee_weight, grind_size, grind_time, water_temp, brew_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      brand,
      blend,
      coffee_weight,
      grind_size,
      grind_time,
      water_temp,
      brew_time,
      notes,
      function(err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: 'Database error', details: err.message });
          return;
        }
        console.log('Configuration saved with ID:', this.lastID);
        // Send a more detailed response
        res.status(201).json({
          success: true,
          id: this.lastID,
          message: 'Configuration saved successfully',
          timestamp: new Date().toISOString()
        });
      }
    );
    stmt.finalize();
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.delete('/api/configs/:id', (req, res) => {
  console.log('Deleting configuration with ID:', req.params.id);
  db.run('DELETE FROM coffee_configs WHERE id = ?', req.params.id, function(err) {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Configuration deleted successfully');
    res.json({ message: 'Config deleted successfully' });
  });
});

// Handle OPTIONS requests
app.options('*', cors(corsOptions));

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log('CORS configuration:', corsOptions);
}); 