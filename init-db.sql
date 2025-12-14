-- Create tables for auth_db
\c auth_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Create tables for schedule_db
\c schedule_db;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "doctorId" UUID NOT NULL,
    "scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY ("doctorId") REFERENCES doctors(id) ON DELETE CASCADE
);

-- Create triggers for schedule tables
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample doctors
INSERT INTO doctors (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Anna'),
('550e8400-e29b-41d4-a716-446655440002', 'Beni'),
('550e8400-e29b-41d4-a716-446655440003', 'Caca'),
('550e8400-e29b-41d4-a716-446655440004', 'Dodi'),
('550e8400-e29b-41d4-a716-446655440005', 'Elsa')
ON CONFLICT (id) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (id, name, email) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Andi', 'andi@email.com'),
('650e8400-e29b-41d4-a716-446655440002', 'Bobi', 'bobi@email.com'),
('650e8400-e29b-41d4-a716-446655440003', 'Chris', 'chris@email.com'),
('650e8400-e29b-41d4-a716-446655440004', 'David', 'david@email.com'),
('650e8400-e29b-41d4-a716-446655440005', 'Emma', 'emma@email.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample schedules
INSERT INTO schedules (id, objective, "customerId", "doctorId", "scheduledAt") VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Regular Checkup', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2025-12-15T09:00:00Z'),
('750e8400-e29b-41d4-a716-446655440002', 'Vaccination', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2025-12-15T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
