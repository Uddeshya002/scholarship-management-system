-- ==========================================================
-- AI-Powered Scholarship and Financial Aid Management System
-- Core DBMS Implementation
-- ==========================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS ScholarshipSystem;
USE ScholarshipSystem;

-- ==========================================================
-- 2. Tables & Constraints (Entity & Domain Integrity)
-- ==========================================================

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Verifier', 'Admin') DEFAULT 'Student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX idx_user_email ON users(email);

-- Student Profiles Table
CREATE TABLE student_profiles (
    user_id INT PRIMARY KEY,
    family_income DECIMAL(10, 2) NOT NULL CHECK (family_income >= 0),
    cgpa DECIMAL(3, 2) NOT NULL CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    category VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Scholarships Table
CREATE TABLE scholarships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    max_income DECIMAL(10, 2) NOT NULL,
    min_cgpa DECIMAL(3, 2) NOT NULL,
    category_required VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    deadline DATE NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Applications Table
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    scholarship_id INT NOT NULL,
    status ENUM('Draft', 'Pending', 'Verified', 'Approved', 'Rejected') DEFAULT 'Draft',
    ai_eligibility_score DECIMAL(5, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(student_id, scholarship_id), -- Prevent duplicate applications
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

CREATE INDEX idx_application_status ON applications(status);

-- Documents Table
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    doc_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Receipts Table
CREATE TABLE receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL UNIQUE,
    receipt_url VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    target_table VARCHAR(100),
    target_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================================
-- 3. Views
-- ==========================================================

-- View for students to see only their essential data
CREATE VIEW vw_student_applications AS
SELECT 
    a.id AS application_id, 
    s.title AS scholarship_title, 
    a.status, 
    a.ai_eligibility_score, 
    a.updated_at
FROM applications a
JOIN scholarships s ON a.scholarship_id = s.id;

-- View for admins to see analytical dashboard data
CREATE VIEW vw_admin_dashboard AS
SELECT 
    status, 
    COUNT(id) AS total_applications,
    AVG(ai_eligibility_score) AS average_score
FROM applications
GROUP BY status;


-- ==========================================================
-- 4. Triggers
-- ==========================================================

DELIMITER //

-- Trigger: Audit Log after Application Status Change
CREATE TRIGGER after_application_update
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO audit_logs (user_id, action, target_table, target_id)
        VALUES (NEW.student_id, CONCAT('Application status changed to ', NEW.status), 'applications', NEW.id);
    END IF;
END;
//

-- Trigger: Auto-create Payment after Approval
CREATE TRIGGER after_application_approve
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    DECLARE scholarship_amount DECIMAL(10,2);
    
    IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
        -- Get scholarship amount
        SELECT amount INTO scholarship_amount FROM scholarships WHERE id = NEW.scholarship_id;
        
        -- Insert into payments
        INSERT INTO payments (application_id, amount, status)
        VALUES (NEW.id, scholarship_amount, 'Pending');
    END IF;
END;
//

-- Trigger: Auto-generate Receipt after Payment Completion
CREATE TRIGGER after_payment_complete
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        INSERT INTO receipts (payment_id, receipt_url)
        VALUES (NEW.id, CONCAT('/receipts/gen_', NEW.id, '.pdf'));
    END IF;
END;
//

DELIMITER ;


-- ==========================================================
-- 5. Stored Procedures & Functions
-- ==========================================================

DELIMITER //

-- Procedure: Calculate Eligibility Score
CREATE PROCEDURE sp_calculate_eligibility (IN p_application_id INT)
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_scholarship_id INT;
    DECLARE v_income DECIMAL(10,2);
    DECLARE v_cgpa DECIMAL(3,2);
    DECLARE v_category VARCHAR(50);
    DECLARE v_max_income DECIMAL(10,2);
    DECLARE v_min_cgpa DECIMAL(3,2);
    DECLARE v_req_category VARCHAR(50);
    DECLARE v_score DECIMAL(5,2) DEFAULT 0.00;

    -- Fetch IDs
    SELECT student_id, scholarship_id INTO v_student_id, v_scholarship_id 
    FROM applications WHERE id = p_application_id;

    -- Fetch Student Data
    SELECT family_income, cgpa, category INTO v_income, v_cgpa, v_category 
    FROM student_profiles WHERE user_id = v_student_id;

    -- Fetch Scholarship Criteria
    SELECT max_income, min_cgpa, category_required INTO v_max_income, v_min_cgpa, v_req_category 
    FROM scholarships WHERE id = v_scholarship_id;

    -- Rule-based ML Mock Logic
    IF v_income <= v_max_income THEN
        SET v_score = v_score + 40;
    END IF;

    IF v_cgpa >= v_min_cgpa THEN
        SET v_score = v_score + (v_cgpa / 10.00) * 40; -- up to 40 points
    END IF;

    IF v_req_category = 'Any' OR v_category = v_req_category THEN
        SET v_score = v_score + 20;
    END IF;

    -- Update Application Score
    UPDATE applications 
    SET ai_eligibility_score = v_score
    WHERE id = p_application_id;

END;
//

DELIMITER ;
