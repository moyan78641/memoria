-- 单租户版本：无用户系统，所有数据属于唯一拥有者

CREATE TABLE IF NOT EXISTS memorials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  memorial_type TEXT NOT NULL DEFAULT 'custom',
  date_mode TEXT NOT NULL DEFAULT 'solar',
  solar_date TEXT,
  lunar_month INTEGER,
  lunar_day INTEGER,
  lunar_leap INTEGER NOT NULL DEFAULT 0,
  start_year INTEGER,
  person TEXT,
  group_name TEXT,
  note TEXT,
  recurring INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memorial_id INTEGER NOT NULL,
  days_before INTEGER NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'email',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (memorial_id) REFERENCES memorials(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reminders_memorial ON reminders(memorial_id);

CREATE TABLE IF NOT EXISTS notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memorial_id INTEGER NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 默认设置
INSERT OR IGNORE INTO settings (key, value) VALUES ('region', 'north');
