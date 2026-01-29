-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE
    ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO tasks (title, description, status) VALUES
    ('Setup Development Environment', 'Install Docker, PostgreSQL, and configure the development environment', 'completed'),
    ('Create Database Schema', 'Design and implement the database schema for the CRUD application', 'completed'),
    ('Build REST API', 'Develop RESTful API endpoints for CRUD operations', 'in-progress'),
    ('Design Frontend UI', 'Create responsive user interface for task management', 'pending'),
    ('Deploy to AWS', 'Deploy the application to AWS EC2 using Docker', 'pending');
