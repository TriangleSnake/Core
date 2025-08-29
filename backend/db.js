// db.js
import sqlite3 from "sqlite3"
import { open } from "sqlite"
import { v4 as uuidv4 } from "uuid"

export async function initDB() {
  const db = await open({
    filename: "./data/app.db",
    driver: sqlite3.Database,
  })

  await db.exec(`PRAGMA foreign_keys = ON;`)

  // 使用者
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 社團
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      id TEXT PRIMARY KEY,
      school TEXT,
      name TEXT NOT NULL,
      info TEXT,
      activity TEXT,
      stars REAL DEFAULT 0
    );
  `)

  // 🔑 關聯表：club <-> user
  await db.exec(`
    CREATE TABLE IF NOT EXISTS club_users (
      club_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (club_id, user_id),
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // 廠商（先保留，之後也能做 company_users）
  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      business_no TEXT,
      name TEXT NOT NULL,
      info TEXT,
      stars REAL DEFAULT 0
    );
  `)

  // 🌱 Example data
  const row = await db.get("SELECT COUNT(*) as c FROM clubs")
  if (row.c === 0) {
    console.log("🌱 Inserting example clubs...")
    await db.run(
      `INSERT INTO clubs (id, school, name, info, activity, stars)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), "成功大學", "熱音社", "喜愛音樂創作與演出", "社團展演、音樂祭", 4.5]
    )
    await db.run(
      `INSERT INTO clubs (id, school, name, info, activity, stars)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), "成功大學", "登山社", "戶外登山健行社團", "每月登山、健行活動", 4.2]
    )
  }

  return db
}
