# Mess Management System Project

A full-stack web application for streamlined mess (canteen) operations, supporting meal management, user/billing administration, menu planning, leave handling, statistics dashboards, and more. The solution targets university hostels and large canteens for digitizing and automating routine food services and management.

---

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Roles & Functionalities](#roles--functionalities)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)

---

## Overview

This Mess Management System provides an end-to-end management platform for mess operations:

- **Meal Booking & Attendance:** Automated tracking and booking of meals.
- **Menu Management:** Dynamic menu planning and updates.
- **User Roles:** Role-based access for Admins, Managers, Students.
- **Billing System:** Automated calculation and payment of monthly mess bills.
- **Leave System:** Track and apply for leaves with automatic meal adjustment.
- **Analytics:** Dashboards & charts for food usage, finances, and trends.

---

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** (ODM: mongoose)
- **Authentication:** JWT, OAuth (Google)
- **Validation:** Joi, Yup
- **Emailing:** Nodemailer
- **Logging:** Morgan, Winston
- **Job Scheduling:** node-cron

### Frontend
- **ReactJS** (with Vite bundler)
- **State Management:** React Context API
- **UI/UX:** TailwindCSS, Radix UI, Lucide Icons
- **Charting:** Recharts
- **Routing:** React Router
- **API Calls:** Axios

---

## System Architecture

### 1. Component Diagram

```mermaid
graph TD
    FE[Frontend (React)] -- API Calls --> BE[Express.js Backend]
    BE -- DB Operations --> DB[(MongoDB)]
    BE -- Authentication --> AUTH[Google OAuth/JWT]
    BE -- Email Notification --> MAIL[Nodemailer]
    BE -- Logs --> LOGS[Loggers/Monitoring]



### 2. Deployment Flow

- User interacts via web UI (React).
- React app calls REST APIs (Express backend).
- Express handles business logic, uses MongoDB for persistent storage.
- Authentication pipelines via JWT and Google OAuth.
- Automated jobs (cron, reminders) for repetitive admin tasks.

---


**If you want to show the "Hosting" subgraph, use:**

```markdown
```mermaid
graph TD
    subgraph Hosting
        FE[Frontend (React)]
        BE[Express.js Backend]
    end
    FE -- API Calls --> BE
    BE -- DB Operations --> DB[(MongoDB)]
    BE -- Authentication --> AUTH[Google OAuth/JWT]
    BE -- Email Notification --> MAIL[Nodemailer]
    BE -- Logs --> LOGS[Loggers/Monitoring]


## Roles & Functionalities

| **Role**    | **Functionalities**                                                                                          |
|-------------|-------------------------------------------------------------------------------------------------------------|
| **Admin**   | User management, menu/billing management, setting up rules/menus, viewing analytics, adding new Managers.    |
| **Manager** | Daily meal oversight, attendance handling, bill insights, menu updates, leave approvals, reporting.          |
| **Student** | Book/cancel meals, apply for leave, view personal bills and meal history, account management.                |

---

## Key Features

- **Secure Sign-In:** JWT & Google OAuth.
- **Real-Time Dashboard:** Meal stats, trends, daily summary.
- **Attendance Tracking:** Accurate meal record-keeping.
- **Menu Planning:** Flexible, calendar-based with easy editing.
- **Leave Management:** Reduces charges for days missed; auto-admin notification.
- **Automated Billing:** Usage-based billing.
- **Email Reminders:** Automated notifications and confirmation mails.
- **Role-Based Access:** Strict API- and UI-level access control.
- **Logging & Monitoring:** All activities and errors are logged.
- **Modern UI/UX:** Responsive and accessible design.

---

## Project Structure

project-root/

├── backend/
│   ├── config/           # Database, environment, passport/jwt configs
│   ├── controllers/      # Business logic and request handlers
│   ├── middleware/       # Auth, error handling, logging middlewares
│   ├── models/           # Mongoose schemas (User, Meal, Menu, Bill, Leave, etc.)
│   ├── routes/           # Express route files
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── mealRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── billRoutes.js
│   │   └── leaveRoutes.js
│   ├── utils/            # Helpers, logger, reminders, utilities
│   ├── validations/      # Joi/Yup validation schemas
│   ├── services/         # Optional: reusable business/service logic
│   ├── uploads/          # Optional: uploaded files/images
│   ├── .env
│   ├── package.json
│   └── server.js         # Backend entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── api/          # API service/helper functions
│   │   ├── assets/       # Images, icons, static assets
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Context API state management
│   │   ├── layouts/      # Optional: layouts (AdminLayout, UserLayout)
│   │   ├── pages/        # Application pages
│   │   │   ├── Dashboard/
│   │   │   ├── Profile/
│   │   │   ├── Menu/
│   │   │   ├── Leave/
│   │   │   └── Billing/
│   │   ├── routes/       # React Router configuration
│   │   ├── utils/        # Frontend helper functions
│   │   ├── App.jsx       # Root React component
│   │   └── main.jsx      # React entry point
│   │
│   ├── package.json
│   └── vite.config.js    # If using Vite
│
├── README.md
├── .gitignore
└── package.json          # Optional root package file
---

## Setup & Installation

### Prerequisites

- Node.js (LTS recommended)
- MongoDB

### Backend

```bash
cd backend
npm install
# Add your .env file per config/env.example
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs by default on http://localhost:5173/  
Backend API is served on http://localhost:3000/

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---


---

## Authors

- [@jyoti445gh](https://github.com/jyoti445gh) and collaborators
