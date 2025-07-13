# Cybersecurity Threat Detection System (MERN Stack)
Webiste video
https://youtu.be/cbXU6QqxTPk
Login page
![8FAC8A9E-DF00-4688-BC2B-CB9C27F98C4D](https://github.com/user-attachments/assets/fe7cebbb-c7e9-4c47-a0b6-7fb510b19a98)
Dashboard
![1CFF0A14-0447-4B00-A9B6-DE64303B9A74](https://github.com/user-attachments/assets/a729417c-03cb-4485-b15d-b6f99014459f)
Threat Management
![A63C789A-52B6-418B-A928-62FFC01FD7DE](https://github.com/user-attachments/assets/895358c4-e5e5-4b35-a4fd-44bbe1f2b53c)
Notification Center
![97709ECF-B662-45E2-9244-B06C34859C82](https://github.com/user-attachments/assets/b6bb670b-f7f3-4fbf-b15a-4e213e8c6df4)
Search&Audit Trail
![95B0AC73-0C5E-4B79-A955-B3BEA8A6C973](https://github.com/user-attachments/assets/98f08ca9-e92c-40a0-8bb2-c4f461c9e9a0)

## 🚀 Overviewer
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
