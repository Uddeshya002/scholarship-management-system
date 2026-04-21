require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'edufund_ai_secret_2024';

// Database Connection
let db;
async function connectDB() {
  try {
    const connectionConfig = process.env.MYSQL_URL ? {
      uri: process.env.MYSQL_URL,
      database: process.env.DB_NAME || 'edufund_db'
    } : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME || 'edufund_db',
    };
    db = await mysql.createPool(connectionConfig);
    console.log('✅ Connected to MySQL Database');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}
connectDB();

// Rate Limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// ============ MIDDLEWARE ============
const auth = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(403).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
};

const adminOnly = (req, res, next) => {
  if (req.role !== 'Admin' && req.role !== 'Verifier') return res.status(403).json({ error: 'Forbidden' });
  next();
};

// ============ AI ELIGIBILITY ENGINE ============
function calculateEligibility(profile, scholarship) {
  let score = 0;
  if (parseFloat(profile.income) <= parseFloat(scholarship.max_income)) 
    score += 40 - ((parseFloat(profile.income) / parseFloat(scholarship.max_income)) * 10);
  if (parseFloat(profile.cgpa) >= parseFloat(scholarship.min_cgpa)) 
    score += (parseFloat(profile.cgpa) / 10) * 40;
  if (scholarship.category_required === 'Any' || profile.category === scholarship.category_required) 
    score += 20;
  return Math.min(Math.max(Math.round((score + (Math.random() * 3 - 1.5)) * 100) / 100, 0), 100);
}

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, family_income, cgpa, category } = req.body;
  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already exists' });
    
    const hash = await bcrypt.hash(password, 10);
    const userRole = role || 'Student';
    
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, userRole]
    );
    const userId = result.insertId;

    if (userRole === 'Student') {
      await db.execute(
        'INSERT INTO student_profiles (user_id, income, cgpa, category, kyc_status) VALUES (?, ?, ?, ?, ?)',
        [userId, family_income || 0, cgpa || 0, category || 'General', 'verified']
      );
    }
    
    const token = jwt.sign({ id: userId, role: userRole }, SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: userId, name, email, role: userRole } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [req.userId]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const [profiles] = await db.execute('SELECT * FROM student_profiles WHERE user_id = ?', [req.userId]);
    
    // Map DB names to Frontend names
    const profileData = profiles[0] ? {
      ...profiles[0],
      family_income: profiles[0].income,
      kyc_verified: profiles[0].kyc_status === 'verified'
    } : null;

    res.json({ ...users[0], profile: profileData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ SCHOLARSHIP ROUTES ============
app.get('/api/scholarships', async (req, res) => {
  const { search, category } = req.query;
  try {
    let query = 'SELECT * FROM scholarships WHERE 1=1';
    let params = [];
    if (search) { query += ' AND title LIKE ?'; params.push(`%${search}%`); }
    if (category && category !== 'All') { query += ' AND (category_required = ? OR category_required = "Any")'; params.push(category); }
    const [results] = await db.execute(query, params);
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/scholarships/:id', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM scholarships WHERE id = ?', [req.params.id]);
    if (!results.length) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/scholarships', auth, adminOnly, async (req, res) => {
  const { title, description, max_income, min_cgpa, category_required, amount, deadline } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO scholarships (title, description, max_income, min_cgpa, category_required, amount, deadline, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, max_income, min_cgpa, category_required, amount, deadline, req.userId]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ APPLICATION ROUTES ============
app.post('/api/applications', auth, async (req, res) => {
  const { scholarship_id } = req.body;
  try {
    const [existing] = await db.execute('SELECT id FROM applications WHERE student_id = ? AND scholarship_id = ?', [req.userId, scholarship_id]);
    if (existing.length) return res.status(409).json({ error: 'Already applied' });
    
    const [profiles] = await db.execute('SELECT * FROM student_profiles WHERE user_id = ?', [req.userId]);
    const [scholarships] = await db.execute('SELECT * FROM scholarships WHERE id = ?', [scholarship_id]);
    
    if (!profiles.length || !scholarships.length) return res.status(400).json({ error: 'Invalid data' });

    const score = calculateEligibility(profiles[0], scholarships[0]);
    const [result] = await db.execute(
      'INSERT INTO applications (student_id, scholarship_id, status, ai_eligibility_score) VALUES (?, ?, "Pending", ?)',
      [req.userId, scholarship_id, score]
    );
    
    await db.execute('INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, "Application Submitted", "applications", ?)', [req.userId, result.insertId]);
    res.status(201).json({ id: result.insertId, student_id: req.userId, scholarship_id, status: 'Pending', ai_eligibility_score: score });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/applications', auth, async (req, res) => {
  try {
    const [apps] = await db.execute(`
      SELECT a.*, s.title as scholarship_title, s.amount as scholarship_amount 
      FROM applications a 
      JOIN scholarships s ON a.scholarship_id = s.id 
      WHERE a.student_id = ?
    `, [req.userId]);
    res.json(apps);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/applications/all', auth, adminOnly, async (req, res) => {
  try {
    const [apps] = await db.execute(`
      SELECT a.*, s.title as scholarship_title, s.amount as scholarship_amount, u.name as student_name, u.email as student_email 
      FROM applications a 
      JOIN scholarships s ON a.scholarship_id = s.id 
      JOIN users u ON a.student_id = u.id
    `);
    res.json(apps);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/applications/:id/status', auth, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    const [apps] = await db.execute('SELECT * FROM applications WHERE id = ?', [req.params.id]);
    if (!apps.length) return res.status(404).json({ error: 'Not found' });
    const app = apps[0];
    
    await db.execute('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    
    if (status === 'Approved' && app.status !== 'Approved') {
      const [scholarships] = await db.execute('SELECT amount FROM scholarships WHERE id = ?', [app.scholarship_id]);
      await db.execute('INSERT INTO payments (application_id, amount, status) VALUES (?, ?, "Completed")', [app.id, scholarships[0].amount]);
    }
    
    await db.execute('INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, ?, "applications", ?)', [req.userId, `Application ${status}`, req.params.id]);
    res.json({ id: req.params.id, status });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ AI ROUTES ============
app.get('/api/ai/recommendations', auth, async (req, res) => {
  try {
    const [profiles] = await db.execute('SELECT * FROM student_profiles WHERE user_id = ?', [req.userId]);
    const [scholarships] = await db.execute('SELECT * FROM scholarships');
    
    if (!profiles.length) return res.json([]);
    const profile = profiles[0];
    
    const recs = scholarships.map(s => ({
      ...s, 
      eligibility_score: calculateEligibility(profile, s),
      is_recommended: calculateEligibility(profile, s) >= 60
    })).sort((a, b) => b.eligibility_score - a.eligibility_score);
    
    res.json(recs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ ADMIN ANALYTICS ============
app.get('/api/admin/analytics', auth, adminOnly, async (req, res) => {
  try {
    const [[{total}]] = await db.execute('SELECT COUNT(*) as total FROM applications');
    const [[{approved}]] = await db.execute('SELECT COUNT(*) as approved FROM applications WHERE status = "Approved"');
    const [[{pending}]] = await db.execute('SELECT COUNT(*) as pending FROM applications WHERE status = "Pending"');
    const [[{rejected}]] = await db.execute('SELECT COUNT(*) as rejected FROM applications WHERE status = "Rejected"');
    const [[{totalDisbursed}]] = await db.execute('SELECT SUM(amount) as totalDisbursed FROM payments WHERE status = "Completed"');
    const [[{totalStudents}]] = await db.execute('SELECT COUNT(*) as totalStudents FROM users WHERE role = "Student"');
    const [[{avgScore}]] = await db.execute('SELECT AVG(ai_eligibility_score) as avgScore FROM applications');
    const [recentLogs] = await db.execute('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10');
    
    res.json({ 
      total, approved, pending, rejected, 
      totalDisbursed: totalDisbursed || 0, 
      totalStudents, 
      avgScore: parseFloat(avgScore || 0).toFixed(1), 
      recentLogs 
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ CHATBOT ============
app.post('/api/chatbot', auth, async (req, res) => {
  const msg = (req.body.message || '').toLowerCase();
  try {
    const [profiles] = await db.execute('SELECT * FROM student_profiles WHERE user_id = ?', [req.userId]);
    const [apps] = await db.execute('SELECT a.*, s.title FROM applications a JOIN scholarships s ON a.scholarship_id = s.id WHERE a.student_id = ? ORDER BY a.created_at DESC', [req.userId]);
    
    let reply = "I'm your EduFund AI assistant. You can ask me about your specific eligibility, application status, or technical details like KYC and security.";

    if (['hi', 'hello', 'hey'].some(k => msg.includes(k))) {
      const [users] = await db.execute('SELECT name FROM users WHERE id = ?', [req.userId]);
      reply = `Hello ${users[0].name}! How can I help you with your scholarship journey today?`;
    } 
    else if (msg.includes('kyc') || msg.includes('verify')) {
      reply = "Our system uses AI-driven background verification. Once you complete your profile with valid details, your KYC is automatically processed and approved.";
    }
    else if (msg.includes('status') || msg.includes('my application')) {
      if (apps.length === 0) reply = "You haven't submitted any applications yet. I recommend starting with the 'Merit Excellence Award' based on your current profile!";
      else reply = `You have ${apps.length} application(s). The most recent is "${apps[0].title}" which is currently in ${apps[0].status} status.`;
    }
    res.json({ reply });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ PAYMENTS ============
app.get('/api/payments', auth, async (req, res) => {
  try {
    const [payments] = await db.execute(`
      SELECT p.*, s.title as scholarship_title 
      FROM payments p 
      JOIN applications a ON p.application_id = a.id 
      JOIN scholarships s ON a.scholarship_id = s.id 
      WHERE a.student_id = ?
    `, [req.userId]);
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ PROFILE ROUTES ============
app.get('/api/profile', auth, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [req.userId]);
    const [profiles] = await db.execute('SELECT * FROM student_profiles WHERE user_id = ?', [req.userId]);
    
    const profileData = profiles[0] ? {
      ...profiles[0],
      family_income: profiles[0].income,
      kyc_verified: profiles[0].kyc_status === 'verified'
    } : null;

    res.json({ ...users[0], profile: profileData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/profile', auth, async (req, res) => {
  const { name, family_income, cgpa, category } = req.body;
  try {
    if (name) await db.execute('UPDATE users SET name = ? WHERE id = ?', [name, req.userId]);
    
    const [existing] = await db.execute('SELECT user_id FROM student_profiles WHERE user_id = ?', [req.userId]);
    if (existing.length) {
      await db.execute(
        'UPDATE student_profiles SET income = ?, cgpa = ?, category = ?, kyc_status = ? WHERE user_id = ?',
        [family_income || 0, cgpa || 0, category || 'General', (cgpa > 0 && family_income > 0) ? 'verified' : 'pending', req.userId]
      );
    } else {
      await db.execute(
        'INSERT INTO student_profiles (user_id, income, cgpa, category, kyc_status) VALUES (?, ?, ?, ?, ?)',
        [req.userId, family_income || 0, cgpa || 0, category || 'General', 'verified']
      );
    }
    
    const [users] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [req.userId]);
    const [profiles] = await db.execute('SELECT * FROM student_profiles WHERE user_id = ?', [req.userId]);
    
    const profileData = profiles[0] ? {
      ...profiles[0],
      family_income: profiles[0].income,
      kyc_verified: profiles[0].kyc_status === 'verified'
    } : null;

    await db.execute('INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, "Profile Updated", "users", ?)', [req.userId, req.userId]);
    res.json({ ...users[0], profile: profileData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`🚀 EduFund AI MySQL Backend running on http://localhost:${PORT}`));
