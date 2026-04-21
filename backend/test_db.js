const mysql = require('mysql2/promise');
async function check() {
  try {
    const connection = await mysql.createConnection({
      host: 'roundhouse.proxy.rlwy.net',
      port: 36329,
      user: 'root',
      password: 'uAIsntwYxOSwLpTnbUoQYyRymQJqUrdv',
      database: 'railway',
      connectTimeout: 20000
    });
    console.log("Connected");
    const [apps] = await connection.execute('SELECT * FROM applications WHERE status = "Approved"');
    console.log("Approved Apps:", apps.length);
    
    const [res] = await connection.execute(`
        INSERT INTO payments (application_id, student_id, amount, status)
        SELECT a.id, a.student_id, COALESCE(s.amount, 50000), 'Completed'
        FROM applications a
        JOIN scholarships s ON a.scholarship_id = s.id
        LEFT JOIN payments p ON a.id = p.application_id
        WHERE a.status = 'Approved' AND p.id IS NULL
    `);
    console.log("Insert result:", res);
    
    connection.end();
  } catch (err) {
    console.error(err);
  }
}
check();
