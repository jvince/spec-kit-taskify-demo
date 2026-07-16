CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, display_name TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('product_manager','engineer')));
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_by_user_id TEXT NOT NULL, created_at TEXT NOT NULL);
