const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create DB connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Login endpoint (stub)
app.post('/login', async (req, res) => {
  // TODO: implement login
  return res.json({});
});

// GET /device-groups
app.get('/device-groups', async (req, res) => {
  const pageNumber = parseInt(req.query.pageNumber || 1, 10);
  const pageSize = parseInt(req.query.pageSize || 10, 10);
  const offset = (pageNumber - 1) * pageSize;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM device_groups ORDER BY id LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    const deviceGroups = rows.map(row => ({
      id: row.id,
      name: row.name,
      city: row.city,
      weatherWidgetId: row.weather_widget_id,
    }));

    const [[{ cnt: totalCount }]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM device_groups`
    );

    return res.json({ deviceGroups, totalCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// POST /device-groups
app.post('/device-groups', async (req, res) => {
  const { name, city, weatherWidgetId } = req.body;

  try {
    await pool.query(
      `INSERT INTO device_groups (user_id, name, city, weather_widget_id) VALUES (?, ?, ?, ?)`,
      [1, name, city, weatherWidgetId] // TODO: Replace 1 with actual user ID from auth
    );
    return res.status(201).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Insert failed' });
  }
});

// GET /device-groups/:groupId/devices
app.get('/device-groups/:groupId/devices', async (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  const pageNumber = parseInt(req.query.pageNumber || 1, 10);
  const pageSize = parseInt(req.query.pageSize || 10, 10);
  const offset = (pageNumber - 1) * pageSize;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM devices WHERE device_group_id = ? ORDER BY id LIMIT ? OFFSET ?`,
      [groupId, pageSize, offset]
    );

    const devices = rows.map(row => ({
      id: row.id,
      serialNumber: row.serial_number,
    }));

    const [[{ cnt: totalCount }]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM devices WHERE device_group_id = ?`,
      [groupId]
    );

    return res.json({ devices, totalCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// GET /health
app.get('/health', async (req, res) => {
  try {
    const [[result]] = await pool.query('SELECT 1');
    if (result['1'] === 1) {
      return res.status(200).json({ status: 'healthy' });
    } else {
      return res.status(500).json({ status: 'unhealthy' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(process.env.APP_PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${process.env.APP_PORT}`);
});
