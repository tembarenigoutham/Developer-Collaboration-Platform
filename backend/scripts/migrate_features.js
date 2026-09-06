import { query } from '../src/config/db.js';

async function runMigrations() {
  try {
    const cols = await query('DESCRIBE users');
    const colNames = cols.map((c) => c.Field);

    if (!colNames.includes('status')) {
      await query("ALTER TABLE users ADD COLUMN status ENUM('ACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE'");
      console.log('Added status column');
    }
    if (!colNames.includes('title')) {
      await query("ALTER TABLE users ADD COLUMN title VARCHAR(100) DEFAULT 'Software Engineer'");
      console.log('Added title column');
    }
    if (!colNames.includes('bio')) {
      await query('ALTER TABLE users ADD COLUMN bio TEXT');
      console.log('Added bio column');
    }
    if (!colNames.includes('skills')) {
      await query("ALTER TABLE users ADD COLUMN skills VARCHAR(255) DEFAULT 'React, Node.js, JavaScript'");
      console.log('Added skills column');
    }
    if (!colNames.includes('github_url')) {
      await query('ALTER TABLE users ADD COLUMN github_url VARCHAR(255)');
      console.log('Added github_url column');
    }
    if (!colNames.includes('linkedin_url')) {
      await query('ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(255)');
      console.log('Added linkedin_url column');
    }

    await query(`
      CREATE TABLE IF NOT EXISTS project_messages (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        project_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('project_messages table ready');

    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();
