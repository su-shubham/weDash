package storage

import (
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
)

func InitDB(dbPath string) (*sql.DB, error) {
    db, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        return nil, err
    }

    // Create table if not exists
    query := `
    CREATE TABLE IF NOT EXISTS weather_summary (
        city TEXT,
        avg_temp REAL,
        max_temp REAL,
        min_temp REAL,
        dominant_condition TEXT,
        date TEXT
    );`
    _, err = db.Exec(query)
    if err != nil {
        return nil, err
    }
    return db, nil
}

func InsertSummary(db *sql.DB, city, condition string, avg, max, min float64, date string) error {
    query := `INSERT INTO weather_summary (city, avg_temp, max_temp, min_temp, dominant_condition, date)
              VALUES (?, ?, ?, ?, ?, ?);`
    _, err := db.Exec(query, city, avg, max, min, condition, date)
    return err
}
