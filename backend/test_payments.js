const mysql = require('mysql2/promise');
async function test() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'edufund_db'
  });
  console.log("Connected");
  
  try {
      const [res] = await connection.execute(`
        INSERT INTO payments (application_id, amount, status)
        SELECT a.id, COALESCE(s.amount, 50000), 'Completed'
        FROM applications a
        JOIN scholarships s ON a.scholarship_id = s.id
        LEFT JOIN payments p ON a.id = p.application_id
        WHERE a.status = 'Approved' AND p.id IS NULL
      `);
      console.log("Insert res:", res);
  } catch (err) {
      console.log("Insert Error:", err);
  }
  
  try {
    const [payments] = await connection.execute(`
      SELECT p.*, s.title as scholarship_title 
      FROM payments p 
      JOIN applications a ON p.application_id = a.id 
      JOIN scholarships s ON a.scholarship_id = s.id 
    `);
    console.log("Payments returned:", payments.length);
  } catch (err) {
    console.log("Select Error:", err);
  }
  
  connection.end();
}
test();
