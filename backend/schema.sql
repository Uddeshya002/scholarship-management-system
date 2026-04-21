-- EDUFUND AI SCHOLARSHIP SYSTEM SCHEMA
CREATE DATABASE IF NOT EXISTS edufund_db;
USE edufund_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Verifier', 'Admin') DEFAULT 'Student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id INT PRIMARY KEY,
    family_income DECIMAL(15, 2) DEFAULT 0,
    cgpa DECIMAL(3, 2) DEFAULT 0,
    category VARCHAR(50) DEFAULT 'General',
    kyc_verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Scholarships
CREATE TABLE IF NOT EXISTS scholarships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    max_income DECIMAL(15, 2),
    min_cgpa DECIMAL(3, 2),
    category_required VARCHAR(50) DEFAULT 'Any',
    amount DECIMAL(15, 2),
    deadline DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 4. Applications
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    scholarship_id INT,
    status ENUM('Draft', 'Pending', 'Verified', 'Approved', 'Rejected') DEFAULT 'Pending',
    ai_eligibility_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id)
);

-- 5. Payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    amount DECIMAL(15, 2),
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id)
);

-- 6. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    target_table VARCHAR(50),
    target_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- INITIAL DATA SEEDING
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@edufund.com', '$2a$10$7tAmKmhFqnjlJ8YtBfRtyOlREnSYJkIsBrsSi9YZijXpMxXQ9dt8u', 'Admin'),
('Rahul Sharma', 'rahul@test.com', '$2a$10$7tAmKmhFqnjlJ8YtBfRtyOlREnSYJkIsBrsSi9YZijXpMxXQ9dt8u', 'Student'),
('Priya Verifier', 'priya@edufund.com', '$2a$10$7tAmKmhFqnjlJ8YtBfRtyOlREnSYJkIsBrsSi9YZijXpMxXQ9dt8u', 'Verifier');

INSERT INTO student_profiles (user_id, family_income, cgpa, category, kyc_verified) VALUES 
(2, 350000, 9.2, 'OBC', TRUE);

INSERT INTO scholarships (title, description, max_income, min_cgpa, category_required, amount, deadline, created_by) VALUES 
('Merit Excellence Award', 'For students with outstanding academic performance.', 800000, 8.5, 'Any', 75000, '2026-08-30', 1),
('Women in STEM Grant', 'Empowering women pursuing Science and Tech.', 600000, 7.5, 'Any', 50000, '2026-07-15', 1),
('National Innovation Fellowship', 'Supporting groundbreaking research ideas.', 1000000, 9.0, 'Any', 100000, '2026-06-30', 1);
