-- Create auth database
SELECT 'CREATE DATABASE auth_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec

-- Create schedule database
SELECT 'CREATE DATABASE schedule_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'schedule_db')\gexec