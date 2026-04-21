const mysql = require('mysql2/promise');
async function backfill() {
  const connection = await mysql.createConnection({
    host: 'roundhouse.proxy.rlwy.net',
    port: 36329,
    user: 'root',
    password: process.env.DB_PASSWORD || 'uAIsntwYxOSwLpTnbUoQYyRymQJqUrdv',
    database: 'railway'
  });
  const [apps] = await connection.execute("SELECT a.id, a.student_id, s.amount FROM applications a JOIN scholarships s ON a.scholarship_id = s.id WHERE a.status = 'Approved'");
  for (const app of apps) {
    const [existing] = await connection.execute('SELECT id FROM payments WHERE application_id = ?', [app.id]);
    if (existing.length === 0) {
      await connection.execute('INSERT INTO payments (application_id, student_id, amount, status) VALUES (?, ?, ?, "Completed")', [app.id, app.student_id, app.amount || 50000]);
      console.log('Added payment for app:', app.id);
    }
  }
  console.log('Backfill complete.');
  connection.end();
}
backfill();
