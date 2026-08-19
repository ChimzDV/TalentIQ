"""
passenger_wsgi.py — cPanel Passenger / WSGI Entry Point
=========================================================
This file is the startup file for cPanel's Python (Passenger) application.

cPanel Setup Reference:
  - Application Root : /home/<cpanel-username>/talentiq-backend   (or wherever you upload backend/)
  - Startup File     : passenger_wsgi.py
  - Entry point      : application

DO NOT RENAME the 'application' variable — Passenger requires this exact name.
"""

import sys
import os

# Add the backend directory itself to sys.path so that 'app' and 'database'
# modules can be imported without package-prefix issues.
_this_dir = os.path.dirname(os.path.abspath(__file__))
if _this_dir not in sys.path:
    sys.path.insert(0, _this_dir)

# Import the Flask app and expose it as 'application' (required by Passenger/WSGI)
from app import app as application  # noqa: F401
