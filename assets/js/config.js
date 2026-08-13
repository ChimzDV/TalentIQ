// TalentIQ Staffing API Configuration
// For local development, it defaults to http://localhost:3000
// For production, replace 'YOUR_PRODUCTION_BACKEND_URL' with your actual deployed backend URL (e.g., https://your-backend.onrender.com)

const PRODUCTION_API_URL = "YOUR_PRODUCTION_BACKEND_URL";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

window.API_BASE_URL = isLocal || PRODUCTION_API_URL === "YOUR_PRODUCTION_BACKEND_URL" 
  ? (window.location.origin.includes('3000') ? window.location.origin : 'http://localhost:3000')
  : PRODUCTION_API_URL;
