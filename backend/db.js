import sqlite3 from "sqlite3"
import { open } from "sqlite"
import bcrypt from "bcrypt"

export async function initDB() {
  const db = await open({
    filename: "./data/app.db",
    driver: sqlite3.Database,
  })

  // 外鍵 + 效能最佳化
  await db.exec(`PRAGMA foreign_keys = ON;`)
  await db.exec(`PRAGMA journal_mode = WAL;`)
  await db.exec(`PRAGMA synchronous = NORMAL;`)

  // ========= Core Tables =========

  // 使用者
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 社團
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      username TEXT PRIMARY KEY,
      school TEXT,
      name TEXT NOT NULL,
      info TEXT,
      activity TEXT,
      stars REAL DEFAULT 0,
      avatar TEXT
    );
  `)


  // 公司
  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      username TEXT PRIMARY KEY,
      business_no TEXT,
      name TEXT NOT NULL,
      info TEXT,
      stars REAL DEFAULT 0,
      avatar TEXT
    );
  `)

  // 社團貼文
  await db.exec(`
    CREATE TABLE IF NOT EXISTS club_posts (
      id TEXT PRIMARY KEY,
      club_username TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      tags TEXT,
      participants INTEGER DEFAULT 0,
      budget INTEGER,
      event_date TEXT,
      event_location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_username) REFERENCES clubs(username) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // 公司貼文
  await db.exec(`
    CREATE TABLE IF NOT EXISTS company_posts (
      id TEXT PRIMARY KEY,
      company_username TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      tags TEXT,
      participants INTEGER DEFAULT 0,
      budget INTEGER,
      event_date TEXT,
      event_location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_username) REFERENCES companies(username) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // 社團成員 (with role)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS club_users (
      club_username TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (club_username, user_id),
      FOREIGN KEY (club_username) REFERENCES clubs(username) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // 公司成員 (with role)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS company_users (
      company_username TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (company_username, user_id),
      FOREIGN KEY (company_username) REFERENCES companies(username) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // ========= Helpful Indexes =========
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_club_users_user ON club_users(user_id);`)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_company_users_user ON company_users(user_id);`)

  // ========= Seed Data =========

  // 預設社團
  const rowClubs = await db.get("SELECT COUNT(*) as c FROM clubs")
  if (rowClubs.c === 0) {
    console.log("🌱 Inserting example clubs...")
    await db.run(
      `INSERT INTO clubs (username, school, name, info, activity, stars)
       VALUES ('ncku-music', '成功大學', '熱音社', '喜愛音樂創作與演出', '社團展演、音樂祭', 4.5)`
    )
    await db.run(
      `INSERT INTO clubs (username, school, name, info, activity, stars)
       VALUES ('ncku-hiking', '成功大學', '登山社', '戶外登山健行社團', '每月登山、健行活動', 4.2)`
    )
  }

  // 預設公司
  const rowCompanies = await db.get("SELECT COUNT(*) as c FROM companies")
  if (rowCompanies.c === 0) {
    console.log("🌱 Inserting example companies...")
    await db.run(
      `INSERT INTO companies (username, business_no, name, info, stars)
       VALUES ('taiwan-tech', '24567890', '台灣科技股份有限公司', '專注於 AI 與雲端解決方案', 4.6)`
    )
    await db.run(
      `INSERT INTO companies (username, business_no, name, info, stars)
       VALUES ('green-energy', '87654321', '綠能創新有限公司', '推動永續能源與綠色科技', 4.3)`
    )
  }

  // 預設使用者 testuser
  const testUser = await db.get("SELECT 1 FROM users WHERE username = 'trianglesnake'")
  if (!testUser) {
    console.log("🌱 Inserting test user...")
    const hash = await bcrypt.hash("password", 10)
    await db.run(
      `INSERT INTO users (id, name, username, email, password_hash)
       VALUES ('test-user-id', 'testuser', 'trianglesnake', 'trianglesnake2002@gmail.com', ?)`,
      [hash]
    )
  }

  // ===== Chats =====
  // 聊天室（可為 1-1 或群組；可選擇綁定 club/company/post）
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      is_group INTEGER NOT NULL DEFAULT 0,
      title TEXT,                       -- 群組名稱（1-1 可為空，由前端顯示對方名稱）
      club_username TEXT,               -- 綁定社團（可為空）
      company_username TEXT,            -- 綁定公司（可為空）
      post_id TEXT,                     -- 綁定某篇 post（可為空）
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_members (
      chat_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',       -- owner / admin / member
      last_read_at DATETIME,            -- 未讀數計算用
      PRIMARY KEY (chat_id, user_id),
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_chat_time ON messages(chat_id, created_at DESC);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);`);


  return db
}
