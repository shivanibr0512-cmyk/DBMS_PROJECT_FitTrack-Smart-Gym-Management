# FitTrack — Smart Gym Management System

A Next.js starter app for the DBMS Level 3 project. It reuses the existing MySQL database (`fittrack_db`) and uses MongoDB for flexible workout progress logs.


## 👥 Team Members

| Name | SRN |
|---|---|
| SHIVANI BR | PES1UG24CS439 |
| SHRIHARI NAGESH | PES1UG24CS445 |

## What is included

- MySQL dashboard counts and completed-payment total
- Members page (MySQL JOIN)
- Attendance page (MySQL JOIN)
- MongoDB workout progress log form and list
- Backend API route handlers
- Email/password login with an HTTP-only signed session cookie
- Two roles: `Admin` and `Trainer` (the demo login accepts both)
- Environment variables for database configuration
- MongoDB `workout_logs` collection with a compound index

## Requirements

- Node.js 20 or later
- MySQL server running, with the seven FitTrack tables already created
- MongoDB local instance or MongoDB Atlas database

## 1. Install

Unzip the project, open Terminal, `cd` into the `fittrack-app` folder, and run:

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and set the real MySQL password, a MongoDB connection string, and a long random `SESSION_SECRET` (at least 32 characters). Never commit `.env.local`.

Example for local MongoDB:
`MONGODB_URI=mongodb://127.0.0.1:27017`

Example for MongoDB Atlas:
Use the connection string from Atlas and replace its password placeholder. Ensure your Atlas network access and database user are configured. Do not share the URI publicly.

## 3. Create authentication table

Open MySQL and select the existing database:

```sql
USE fittrack_db;

CREATE TABLE IF NOT EXISTS app_users (
  User_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(150) NOT NULL UNIQUE,
  Password_Hash VARCHAR(255) NOT NULL,
  Role ENUM('Admin','Trainer') NOT NULL,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Generate a bcrypt password hash using Node (replace `YourStrongPassword123!` with your chosen demo password):

```bash
node -e "require('bcryptjs').hash('YourStrongPassword123!', 12).then(console.log)"
```

Copy the resulting hash. In MySQL, insert two accounts (replace each `HASH_FROM_NODE` with the generated bcrypt hash; use a different hash if you want a different password):

```sql
INSERT INTO app_users (Name, Email, Password_Hash, Role)
VALUES
('FitTrack Admin', 'admin@fittrack.local', 'HASH_FROM_NODE', 'Admin'),
('FitTrack Trainer', 'trainer@fittrack.local', 'HASH_FROM_NODE', 'Trainer');
```

For a classroom demo, you can use the same generated hash for both accounts. Login emails are `admin@fittrack.local` and `trainer@fittrack.local`; the password is the one you hashed. These are demo accounts, not production credentials.

## 4. Start app

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. Sign in with one of the demo accounts.

## MongoDB data model

Database: `fittrack_nosql`
Collection: `workout_logs`
Example document:

```json
{
  "memberId": 1,
  "memberName": "Aarav Sharma",
  "activity": "Strength training",
  "durationMinutes": 45,
  "notes": "Upper body session",
  "createdAt": "BSON Date"
}
```

The schema is flexible because workout notes and activity details can vary. An index on `{ memberId: 1, createdAt: -1 }` supports a member's recent workout log lookup. The app currently lists the latest 100 logs.

## SQL / NoSQL division

- MySQL: members, trainers, memberships, workout plans, attendance, payments, renewals, login accounts.
- MongoDB: variable-shape workout progress logs and notes.
- `memberId` in a MongoDB document references `MEMBER.Member_ID` logically. MongoDB does not enforce MySQL foreign keys, so backend validation is needed before a production release.

## API endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/members`
- `GET /api/attendance`
- `GET /api/workout-logs`
- `POST /api/workout-logs`

All data endpoints require a valid session.

## Important limitations / next improvements

This is a coursework starter, not a production-ready gym system. Before real deployment, add stricter role-based permissions per route, CSRF protection, account rate limiting, member-ID existence checks for Mongo workout logs, robust error logging, and tests. The starter has two role values and authenticated routes, but it does not yet enforce different permissions for every action.
