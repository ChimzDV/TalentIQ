require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware to support GitHub Pages and local frontend environments
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Session middleware setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'talentiq_secret_session_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    httpOnly: true
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.redirect('/talentiq-admin/login');
  }
}

// Redirect middleware to prevent logged-in admins from seeing login page
function redirectIfLoggedIn(req, res, next) {
  if (req.session && req.session.isAdmin) {
    res.redirect('/talentiq-admin/dashboard');
  } else {
    next();
  }
}

// Serve public static files (exclude admin views)
app.use(express.static(path.join(__dirname), {
  index: 'index.html'
}));

// API: Get published jobs for public Careers page
app.get('/api/jobs', (req, res) => {
  db.all("SELECT * FROM jobs WHERE status = 'published' ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve jobs' });
    }
    res.json(rows);
  });
});

// Admin Authentication routes
app.get('/talentiq-admin/login', redirectIfLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-views', 'login.html'));
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get("SELECT * FROM admins WHERE username = ?", [username], (err, admin) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = bcrypt.compareSync(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.isAdmin = true;
    req.session.username = admin.username;
    res.json({ success: true, redirect: '/talentiq-admin/dashboard' });
  });
});

app.get('/talentiq-admin/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/talentiq-admin/login');
  });
});

// Admin Panel protected views
app.get('/talentiq-admin', requireAuth, (req, res) => {
  res.redirect('/talentiq-admin/dashboard');
});

app.get('/talentiq-admin/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-views', 'dashboard.html'));
});

// Protected Admin APIs
app.get('/api/admin/jobs', requireAuth, (req, res) => {
  db.all("SELECT * FROM jobs ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve jobs' });
    }
    res.json(rows);
  });
});

app.post('/api/admin/jobs', requireAuth, (req, res) => {
  const {
    title, industry, location, state, employment_type, experience, salary,
    short_description, description, requirements, responsibilities, benefits,
    application_deadline, status
  } = req.body;

  if (!title || !industry || !location || !employment_type) {
    return res.status(400).json({ error: 'Title, Industry, Location, and Employment Type are required' });
  }

  const query = `
    INSERT INTO jobs (
      title, industry, location, state, employment_type, experience, salary,
      short_description, description, requirements, responsibilities, benefits,
      application_deadline, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  db.run(query, [
    title, industry, location, state || '', employment_type, experience || '', salary || '',
    short_description || '', description || '', requirements || '', responsibilities || '', benefits || '',
    application_deadline || '', status || 'draft'
  ], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create job' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

app.put('/api/admin/jobs/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const {
    title, industry, location, state, employment_type, experience, salary,
    short_description, description, requirements, responsibilities, benefits,
    application_deadline, status
  } = req.body;

  if (!title || !industry || !location || !employment_type) {
    return res.status(400).json({ error: 'Title, Industry, Location, and Employment Type are required' });
  }

  const query = `
    UPDATE jobs SET
      title = ?, industry = ?, location = ?, state = ?, employment_type = ?, experience = ?, salary = ?,
      short_description = ?, description = ?, requirements = ?, responsibilities = ?, benefits = ?,
      application_deadline = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [
    title, industry, location, state, employment_type, experience, salary,
    short_description, description, requirements, responsibilities, benefits,
    application_deadline, status, id
  ], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update job' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ success: true });
  });
});

app.delete('/api/admin/jobs/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM jobs WHERE id = ?", [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete job' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ success: true });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
