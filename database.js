const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'talentiq.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create jobs table
  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      industry TEXT NOT NULL,
      location TEXT NOT NULL,
      state TEXT,
      employment_type TEXT NOT NULL,
      experience TEXT,
      salary TEXT,
      short_description TEXT,
      description TEXT,
      requirements TEXT,
      responsibilities TEXT,
      benefits TEXT,
      application_deadline TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create admins table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Check if admins table is empty, if so, seed a default admin
  db.get("SELECT COUNT(*) as count FROM admins", [], (err, row) => {
    if (err) {
      console.error("Error checking admins table:", err);
      return;
    }
    if (row.count === 0) {
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin@talentiq.com';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'TalentIQ2026!';
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(defaultPassword, salt);
      db.run("INSERT INTO admins (username, password) VALUES (?, ?)", [defaultUsername, hashedPassword], (err) => {
        if (err) {
          console.error("Error seeding default admin:", err);
        } else {
          console.log(`Default admin created: ${defaultUsername}`);
        }
      });
    }
  });

  // Check if jobs table is empty, if so, seed existing hardcoded jobs
  db.get("SELECT COUNT(*) as count FROM jobs", [], (err, row) => {
    if (err) {
      console.error("Error checking jobs table:", err);
      return;
    }
    if (row.count === 0) {
      const initialJobs = [
        {
          title: "Administrative Assistant",
          industry: "federal",
          location: "New York, NY",
          state: "NY",
          employment_type: "full-time",
          experience: "1-3 Years",
          salary: "$45,000 - $55,000",
          short_description: "Support daily office operations, coordinate executive calendars, manage meetings, and assist in maintaining administrative systems.",
          description: "We are seeking a detail-oriented and organized Administrative Assistant to manage day-to-day office operations, handle correspondence, coordinate schedules, and assist with reporting tasks.",
          requirements: "High school diploma or equivalent;Proficiency in MS Office Suite;Excellent organizational and time management skills;High attention to detail",
          responsibilities: "Coordinate calendars and meetings;Manage administrative files and physical records;Handle correspondence and answer phone queries;Assist in drafting presentations and reports",
          benefits: "Comprehensive medical & dental coverage;Paid time off (PTO);401(k) matching program",
          status: "published"
        },
        {
          title: "Customer Service Representative",
          industry: "it",
          location: "Remote / USA",
          state: "USA",
          employment_type: "full-time",
          experience: "1-2 Years",
          salary: "$18 - $22/hr",
          short_description: "Provide exceptional support to customers, answer inquiries, resolve issues promptly, and maintain high client satisfaction scores.",
          description: "Seeking customer-focused individuals to join our remote support team. You will be dealing with client queries and helping resolve issues via email, chat, and phone.",
          requirements: "Excellent verbal and written communication;Ability to multitask under pressure;Basic CRM knowledge;Empathetic and positive attitude",
          responsibilities: "Respond to client inquiries via email, chat, and phone;Troubleshoot product issues and process exchanges/returns;Document customer service queries in CRM system;Collaborate with operations teams",
          benefits: "100% remote work flexibility;Performance-based bonuses;Health and wellness stipend",
          status: "published"
        },
        {
          title: "Warehouse Associate",
          industry: "engineering",
          location: "Chicago, IL",
          state: "IL",
          employment_type: "part-time",
          experience: "0-1 Years",
          salary: "$17 - $20/hr",
          short_description: "Perform warehouse operations including receiving, cataloging, picking, packing, sorting, and prepping orders for shipping.",
          description: "A fast-paced warehouse in Chicago is looking for reliable warehouse associates. Duties include cataloging shipments, picking and packing orders, and maintaining orderliness.",
          requirements: "Ability to lift up to 50 lbs;Reliable transportation;Strong work ethic and punctual attendance;Basic safety knowledge",
          responsibilities: "Load and unload stock containers safely;Pack and catalog shipments accurately;Keep warehouse environment clean and orderly;Report stock damage or discrepancies",
          benefits: "Competitive hourly wages;Flexible scheduling;Overtime opportunities",
          status: "published"
        },
        {
          title: "Registered Nurse",
          industry: "healthcare",
          location: "Dallas, TX",
          state: "TX",
          employment_type: "full-time",
          experience: "2+ Years",
          salary: "$85,000 - $95,000",
          short_description: "Deliver exceptional patient care, coordinate clinical treatment plans, and collaborate with physicians in a modern clinical setting.",
          description: "Seeking a dedicated Registered Nurse (RN) to deliver direct patient care, perform checks, administer medications, and collaborate with doctors on plans of care.",
          requirements: "Active state Registered Nurse (RN) license;Associate or Bachelor degree in Nursing;CPR and BLS certification;Compassionate customer-facing manner",
          responsibilities: "Observe and record patient vital signs;Administer medications and schedule procedures;Educate patients and families on post-treatment care;Collaborate with healthcare teams",
          benefits: "Top tier medical, dental & vision plans;Continuing education reimbursement;Flexible shift patterns",
          status: "published"
        },
        {
          title: "Sales Executive",
          industry: "aerospace",
          location: "Los Angeles, CA",
          state: "CA",
          employment_type: "contract",
          experience: "3-5 Years",
          salary: "Commission + Base",
          short_description: "Drive customer acquisition, perform product demonstrations, negotiate proposals, and grow the territory pipeline of clients.",
          description: "We are seeking a driven Sales Executive on a contract basis to identify and close opportunities in the aerospace sector.",
          requirements: "Proven history in sales or client acquisition;Strong relationship-building capability;Ability to work independently;Bachelor degree preferred",
          responsibilities: "Sourcing leads and qualifying prospect pipeline;Conducting presentations and customized product demos;Negotiating contracts to close sales deals;Maintaining CRM updates",
          benefits: "Highly competitive base and uncapped commission;Travel expenses compensated;Opportunity for permanent conversion",
          status: "published"
        },
        {
          title: "HR Coordinator",
          industry: "federal",
          location: "Atlanta, GA",
          state: "GA",
          employment_type: "full-time",
          experience: "1-3 Years",
          salary: "$50,000 - $60,000",
          short_description: "Assist with onboarding operations, organize employment documentation, and support overall company human resource programs.",
          description: "We are hiring an HR Coordinator to handle onboarding procedures, organize personnel files, and assist the HR director with general administrative duties.",
          requirements: "Bachelor degree in HR or business related field;Familiarity with employment law;Outstanding confidentiality;Strong organizational skills",
          responsibilities: "Assist with employee onboarding and scheduling;Organize employment agreements and personal records;Support HR admin and payroll departments;Coordinate employee appreciation events",
          benefits: "Comprehensive medical plans;401(k) match;Annual career advancement stipends",
          status: "published"
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO jobs (
          title, industry, location, state, employment_type, experience, salary, 
          short_description, description, requirements, responsibilities, benefits, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const job of initialJobs) {
        stmt.run([
          job.title,
          job.industry,
          job.location,
          job.state,
          job.employment_type,
          job.experience,
          job.salary,
          job.short_description,
          job.description,
          job.requirements,
          job.responsibilities,
          job.benefits,
          job.status
        ]);
      }
      stmt.finalize();
      console.log("Initial jobs seeded successfully.");
    }
  });
});

module.exports = db;
