"""
app.py — TalentIQ Staffing Flask Backend
=========================================
Replaces Node.js/Express server.js for cPanel Python/Passenger hosting.

API endpoints (JSON responses are 1-to-1 compatible with the existing frontend):
    GET    /api/jobs                  — public: returns published jobs
    POST   /api/admin/login           — public: authenticates admin
    GET    /api/admin/jobs            — protected: returns all jobs
    POST   /api/admin/jobs            — protected: creates a job
    PUT    /api/admin/jobs/<id>       — protected: updates a job
    DELETE /api/admin/jobs/<id>       — protected: deletes a job

Admin views (HTML pages served directly by Flask):
    GET    /talentiq-admin/login      — serves admin-views/login.html
    GET    /talentiq-admin/dashboard  — serves admin-views/dashboard.html (protected)
    GET    /talentiq-admin/logout     — clears session, redirects to login
    GET    /talentiq-admin            — redirects to /talentiq-admin/dashboard
"""

import os
import bcrypt
from functools import wraps
from flask import (
    Flask, request, session, jsonify, redirect,
    url_for, send_from_directory, abort
)
from flask_cors import CORS
from dotenv import load_dotenv
from database import init_db, seed_db, db_connection

# ---------------------------------------------------------------------------
# Load environment variables (.env file is optional — defaults are safe)
# ---------------------------------------------------------------------------
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_THIS_DIR, '.env'))

# ---------------------------------------------------------------------------
# Application setup
# ---------------------------------------------------------------------------
app = Flask(
    __name__,
    # Serve static frontend files from the project root (one level up)
    static_folder=os.path.join(_THIS_DIR, '..'),
    static_url_path='',
)

# Secret key for session signing — must be set in production via .env
app.secret_key = os.environ.get('SESSION_SECRET', 'talentiq_secret_session_key_2026')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 7200  # 2 hours (matches Node.js config)

# ---------------------------------------------------------------------------
# CORS configuration
# ---------------------------------------------------------------------------
# ALLOWED_ORIGIN can be set in .env on the server.
# If serving frontend and API from the same domain (recommended cPanel setup),
# same-origin requests need no CORS at all, but Flask-CORS handles both cases.
_allowed_origin = os.environ.get('ALLOWED_ORIGIN', '*')
CORS(app, resources={r"/api/*": {"origins": _allowed_origin}},
     supports_credentials=True)

# ---------------------------------------------------------------------------
# Paths to admin HTML views (relative to project root)
# ---------------------------------------------------------------------------
_PROJECT_ROOT = os.path.normpath(os.path.join(_THIS_DIR, '..'))
_ADMIN_VIEWS  = os.path.join(_PROJECT_ROOT, 'admin-views')


# ---------------------------------------------------------------------------
# Auth decorators (mirrors Node.js requireAuth / redirectIfLoggedIn)
# ---------------------------------------------------------------------------
def require_auth(f):
    """Protect an endpoint — returns 401 JSON for API routes, redirect for pages."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('is_admin'):
            return f(*args, **kwargs)
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Unauthorized'}), 401
        return redirect('/talentiq-admin/login')
    return decorated


def redirect_if_logged_in(f):
    """Redirect already-authenticated admins away from the login page."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('is_admin'):
            return redirect('/talentiq-admin/dashboard')
        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# Helper: convert a sqlite3.Row to a plain dict
# ---------------------------------------------------------------------------
def row_to_dict(row):
    return dict(row) if row else None


# ===========================================================================
# Public API
# ===========================================================================

@app.route('/api/jobs', methods=['GET'])
def get_published_jobs():
    """Return all published job listings (public endpoint)."""
    try:
        with db_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM jobs WHERE status = 'published' ORDER BY created_at DESC"
            ).fetchall()
        return jsonify([row_to_dict(r) for r in rows])
    except Exception as e:
        app.logger.error(f"GET /api/jobs error: {e}")
        return jsonify({'error': 'Failed to retrieve jobs'}), 500


# ===========================================================================
# Admin authentication
# ===========================================================================

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Authenticate an admin and set session."""
    data = request.get_json(force=True, silent=True) or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        with db_connection() as conn:
            admin = conn.execute(
                "SELECT * FROM admins WHERE username = ?", (username,)
            ).fetchone()
    except Exception as e:
        app.logger.error(f"POST /api/admin/login DB error: {e}")
        return jsonify({'error': 'Database error'}), 500

    if not admin:
        return jsonify({'error': 'Invalid credentials'}), 401

    # bcrypt.checkpw is fully compatible with bcryptjs hashes from Node.js
    stored_hash = admin['password']
    if isinstance(stored_hash, str):
        stored_hash = stored_hash.encode('utf-8')

    if not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
        return jsonify({'error': 'Invalid credentials'}), 401

    session.permanent = True
    session['is_admin'] = True
    session['username'] = admin['username']

    return jsonify({'success': True, 'redirect': '/talentiq-admin/dashboard'})


# ===========================================================================
# Admin HTML views
# ===========================================================================

@app.route('/talentiq-admin/login', methods=['GET'])
@redirect_if_logged_in
def admin_login_page():
    return send_from_directory(_ADMIN_VIEWS, 'login.html')


@app.route('/talentiq-admin/logout', methods=['GET'])
def admin_logout():
    session.clear()
    return redirect('/talentiq-admin/login')


@app.route('/talentiq-admin', methods=['GET'])
@require_auth
def admin_root():
    return redirect('/talentiq-admin/dashboard')


@app.route('/talentiq-admin/dashboard', methods=['GET'])
@require_auth
def admin_dashboard():
    return send_from_directory(_ADMIN_VIEWS, 'dashboard.html')


# ===========================================================================
# Protected Admin API — Jobs CRUD
# ===========================================================================

@app.route('/api/admin/jobs', methods=['GET'])
@require_auth
def admin_get_jobs():
    """Return all jobs (published + draft) for the admin dashboard."""
    try:
        with db_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM jobs ORDER BY created_at DESC"
            ).fetchall()
        return jsonify([row_to_dict(r) for r in rows])
    except Exception as e:
        app.logger.error(f"GET /api/admin/jobs error: {e}")
        return jsonify({'error': 'Failed to retrieve jobs'}), 500


@app.route('/api/admin/jobs', methods=['POST'])
@require_auth
def admin_create_job():
    """Create a new job listing."""
    data = request.get_json(force=True, silent=True) or {}

    title           = (data.get('title') or '').strip()
    industry        = (data.get('industry') or '').strip()
    location        = (data.get('location') or '').strip()
    employment_type = (data.get('employment_type') or '').strip()

    if not title or not industry or not location or not employment_type:
        return jsonify({'error': 'Title, Industry, Location, and Employment Type are required'}), 400

    sql = """
        INSERT INTO jobs (
            title, industry, location, state, employment_type, experience, salary,
            short_description, description, requirements, responsibilities, benefits,
            application_deadline, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """
    params = (
        title,
        industry,
        location,
        (data.get('state') or ''),
        employment_type,
        (data.get('experience') or ''),
        (data.get('salary') or ''),
        (data.get('short_description') or ''),
        (data.get('description') or ''),
        (data.get('requirements') or ''),
        (data.get('responsibilities') or ''),
        (data.get('benefits') or ''),
        (data.get('application_deadline') or ''),
        (data.get('status') or 'draft'),
    )

    try:
        with db_connection() as conn:
            cursor = conn.execute(sql, params)
            new_id = cursor.lastrowid
        return jsonify({'success': True, 'id': new_id})
    except Exception as e:
        app.logger.error(f"POST /api/admin/jobs error: {e}")
        return jsonify({'error': 'Failed to create job'}), 500


@app.route('/api/admin/jobs/<int:job_id>', methods=['PUT'])
@require_auth
def admin_update_job(job_id):
    """Update an existing job listing."""
    data = request.get_json(force=True, silent=True) or {}

    title           = (data.get('title') or '').strip()
    industry        = (data.get('industry') or '').strip()
    location        = (data.get('location') or '').strip()
    employment_type = (data.get('employment_type') or '').strip()

    if not title or not industry or not location or not employment_type:
        return jsonify({'error': 'Title, Industry, Location, and Employment Type are required'}), 400

    sql = """
        UPDATE jobs SET
            title = ?, industry = ?, location = ?, state = ?, employment_type = ?,
            experience = ?, salary = ?, short_description = ?, description = ?,
            requirements = ?, responsibilities = ?, benefits = ?,
            application_deadline = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """
    params = (
        title,
        industry,
        location,
        (data.get('state') or ''),
        employment_type,
        (data.get('experience') or ''),
        (data.get('salary') or ''),
        (data.get('short_description') or ''),
        (data.get('description') or ''),
        (data.get('requirements') or ''),
        (data.get('responsibilities') or ''),
        (data.get('benefits') or ''),
        (data.get('application_deadline') or ''),
        (data.get('status') or 'draft'),
        job_id,
    )

    try:
        with db_connection() as conn:
            cursor = conn.execute(sql, params)
            if cursor.rowcount == 0:
                return jsonify({'error': 'Job not found'}), 404
        return jsonify({'success': True})
    except Exception as e:
        app.logger.error(f"PUT /api/admin/jobs/{job_id} error: {e}")
        return jsonify({'error': 'Failed to update job'}), 500


@app.route('/api/admin/jobs/<int:job_id>', methods=['DELETE'])
@require_auth
def admin_delete_job(job_id):
    """Delete a job listing."""
    try:
        with db_connection() as conn:
            cursor = conn.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
            if cursor.rowcount == 0:
                return jsonify({'error': 'Job not found'}), 404
        return jsonify({'success': True})
    except Exception as e:
        app.logger.error(f"DELETE /api/admin/jobs/{job_id} error: {e}")
        return jsonify({'error': 'Failed to delete job'}), 500


# ===========================================================================
# Initialise database on startup
# ===========================================================================
with app.app_context():
    init_db()   # creates tables if they don't exist (safe on existing DB)
    seed_db()   # seeds data only if tables are empty


# ===========================================================================
# Run locally for development
# ===========================================================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
