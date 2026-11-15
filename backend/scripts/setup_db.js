import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { config } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('====================================================');
  console.log('🔄 DevCollab Database Setup & Initialization');
  console.log('====================================================');

  const connectionConfig = {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true
  };

  let connection;
  try {
    console.log(`Connecting to MySQL host: ${config.db.host}:${config.db.port} as ${config.db.user}...`);
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to MySQL server.');

    // 1. Create database if it doesn't exist
    const dbName = config.db.database || 'developer_platform';
    console.log(`Ensuring database "${dbName}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`✅ Using database "${dbName}".`);

    // 2. Read and apply schema.sql
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Executing schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('✅ Base schema created successfully.');
    }

    // 3. Ensure extra columns and project_messages table (migrations)
    try {
      const [cols] = await connection.query('DESCRIBE users');
      const colNames = cols.map(c => c.Field);

      if (!colNames.includes('status')) {
        await connection.query("ALTER TABLE users ADD COLUMN status ENUM('ACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE'");
      }
      if (!colNames.includes('title')) {
        await connection.query("ALTER TABLE users ADD COLUMN title VARCHAR(100) DEFAULT 'Software Engineer'");
      }
      if (!colNames.includes('bio')) {
        await connection.query('ALTER TABLE users ADD COLUMN bio TEXT');
      }
      if (!colNames.includes('skills')) {
        await connection.query("ALTER TABLE users ADD COLUMN skills VARCHAR(255) DEFAULT 'React, Node.js, JavaScript'");
      }
      if (!colNames.includes('github_url')) {
        await connection.query('ALTER TABLE users ADD COLUMN github_url VARCHAR(255)');
      }
      if (!colNames.includes('linkedin_url')) {
        await connection.query('ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(255)');
      }

      await connection.query(`
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
      console.log('✅ Applied user profile and project_messages schema migrations.');
    } catch (migErr) {
      console.warn('Migration note:', migErr.message);
    }

    // 4. Seed initial data if users table is empty
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0]?.count === 0) {
      const seedPath = path.resolve(__dirname, '../../database/seed.sql');
      if (fs.existsSync(seedPath)) {
        console.log('Seeding initial demo data...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await connection.query(seedSql);
        console.log('✅ Initial demo data seeded successfully.');
      }
    } else {
      console.log(`ℹ️ Database already contains ${userRows[0]?.count} users. Preserving existing data.`);
    }

    console.log('====================================================');
    console.log('🎉 Database setup completed successfully!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
