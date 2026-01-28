-- Up
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    wiki TEXT NOT NULL,
    url TEXT NOT NULL,
    cf_ray TEXT NOT NULL,
    forced INTEGER NOT NULL CHECK (forced IN (0, 1)),
    speedscope_data BLOB NOT NULL,
    parser_report TEXT,
    environment TEXT NOT NULL
);
CREATE INDEX idx_profiles_timestamp ON profiles (timestamp);
CREATE INDEX idx_profiles_wiki ON profiles (wiki);
CREATE INDEX idx_profiles_url ON profiles (url);
CREATE INDEX idx_profiles_cf_ray ON profiles (cf_ray);
CREATE INDEX idx_profiles_forced ON profiles (forced);
CREATE INDEX idx_profiles_environment ON profiles (environment);

CREATE TABLE aggregated_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    type TEXT NOT NULL,
    profile_count INTEGER NOT NULL,
    speedscope_data BLOB NOT NULL
);
CREATE INDEX idx_aggregated_profiles_type ON aggregated_profiles (type);

-- Down
DROP TABLE profiles;
DROP TABLE aggregated_profiles;
