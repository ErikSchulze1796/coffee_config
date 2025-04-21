const sqlite3 = require('sqlite3').verbose();

class CoffeeConfigRepository {
  constructor(db) {
    this.db = db;
  }

  findAll() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM coffee_configs', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  save(config) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO coffee_configs 
        (brand, blend, coffee_weight, grind_size, grind_time, water_temp, brew_time, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        config.brand,
        config.blend,
        config.coffee_weight,
        config.grind_size,
        config.grind_time,
        config.water_temp,
        config.brew_time,
        config.notes,
        function(err) {
          stmt.finalize();
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM coffee_configs WHERE id = ?', id, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = CoffeeConfigRepository; 