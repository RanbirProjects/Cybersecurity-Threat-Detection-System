# Cybersecurity Threat Detection System (MERN Stack)

## 🚀 Overview
A real-time web-based platform to detect, log, and visualize suspicious user activities (e.g., brute-force login attempts, SQL injections, suspicious IPs) using the MERN stack. Designed for organizations to proactively monitor and manage potential threats.

---

## 🧱 Tech Stack
- **MongoDB** – Store logs, user metadata, threat categories, IP history, etc.
- **Express.js** – RESTful APIs for data logging, authentication, and data retrieval.
- **React.js** – Admin dashboard UI to visualize threats, alerts, and logs.
- **Node.js** – Backend logic for processing logs, pattern matching, and alert generation.

---

## 🧩 Core Features
- **User Authentication & Authorization** (JWT, role-based)
- **Real-time Threat Logging** (REST API, IP, action, timestamp, geolocation)
- **Threat Analysis Engine** (Brute-force, SQLi, XSS detection)
- **Admin Dashboard** (Charts, filters, heatmaps, timelines)
- **Notification System** (Email/Slack/Webhooks)
- **Search & Audit Trail** (Full-text search, timeline view)
- **Security Measures** (HTTPS, CORS, rate limiting, Helmet.js, input validation)

---

## 📂 Folder Structure
```
/client      # React frontend
/server      # Node.js backend
  /models
  /routes
  /controllers
  /utils
  /middleware
.env         # Environment variables
```

---

## ⚡️ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-username/cybersecurity-threat-detection-system.git
cd cybersecurity-threat-detection-system
```

### 2. Install dependencies
```bash
npm run install-all
```

### 3. Set up environment variables
- Copy `.env.example` to `.env` in both `/server` and `/client` and fill in the required values.

### 4. Start the development servers
```bash
npm run dev
```
- Backend: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:3000](http://localhost:3000)

---

## 🛡️ Deployment
- **MongoDB Atlas** for database
- **Render / Railway / Cyclic** for backend API
- **Netlify / Vercel** for frontend
- **PM2 + Nginx** for scalable hosting

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
[MIT](LICENSE) 