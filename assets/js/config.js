// TalentIQ Staffing — API Base URL Configuration
// ─────────────────────────────────────────────────────────────────────────────
// BACKEND: Python / Flask (replaces Node.js/Express)
//
// PRODUCTION (cPanel deployment):
//   The Flask app runs on the same domain as this website via Passenger.
//   Set PRODUCTION_API_URL to an empty string "" so all /api/* calls are
//   same-origin — no CORS required, and no absolute URL to maintain.
//
//   Example (same-domain):  const PRODUCTION_API_URL = "";
//   Example (subdomain):    const PRODUCTION_API_URL = "https://api.talentiqstaffing.com";
//
// LOCAL DEVELOPMENT (Flask running on port 5000):
//   Leave PRODUCTION_API_URL as "YOUR_PRODUCTION_BACKEND_URL" and the code
//   will automatically fall back to http://localhost:5000.
// ─────────────────────────────────────────────────────────────────────────────

// ↓ REPLACE THIS with "" for same-domain cPanel deployment, or your API subdomain URL
const PRODUCTION_API_URL = "YOUR_PRODUCTION_BACKEND_URL";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const isPlaceholder = PRODUCTION_API_URL === "YOUR_PRODUCTION_BACKEND_URL";

if (isLocal || isPlaceholder) {
  // Local development: try Flask default port 5000, fall back to Node.js port 3000
  const localPort = window.location.port;
  if (localPort === "5000" || localPort === "3000") {
    window.API_BASE_URL = window.location.origin;
  } else {
    window.API_BASE_URL = "http://localhost:5000";
  }
} else {
  // Production: use configured URL (empty string = same-origin)
  window.API_BASE_URL = PRODUCTION_API_URL;
}
