# 🎓 UniSync — Campus Connectivity Reimagined

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Framework: Expo](https://img.shields.io/badge/Framework-Expo_v54-000020.svg?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB.svg?logo=react&logoColor=black)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_/_Express-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**UniSync** is a premium, full-stack campus collaboration and student portfolio management mobile application designed to bridge the gap between academic progress, professional profiling, and daily campus operations. Developed as a collaborative group academic project, UniSync utilizes a powerful, scalable architecture consisting of a React Native (Expo) frontend and a robust Node.js/Express/MongoDB backend to offer students a modern, unified environment to manage their university journey.

---

## ✨ Core Modules & Features

### 💼 Professional Student Portfolio
* **Interactive Dynamic Timeline**: Curate and present achievements, projects, certifications, experiences, and extracurricular activities.
* **Premium Custom Calendar Picker**: Fully integrated, sleek [DatePickerModal](file:///D:/new/uniSync-mobileApp/client/src/components/DatePickerModal.js) offering fluid native-feeling navigation for choosing Start and End dates without manual input.
* **Resource Uploads**: Securely upload certificates, project mockups, or profile photos utilizing integrated cloud storage (AWS S3) or local server uploads.
* **Public/Private Toggle**: Instantly control the visibility of individual portfolio items on your public profile.
* **External Links Integration**: Direct click-to-open links to GitHub repositories, live demo URLs, and social platforms.

### 📚 Academic Resources Hierarchy
* Navigate seamlessly through nested campus structures: **Faculties ➔ Departments ➔ Modules**.
* Upload and retrieve academic materials, lecture notes, and revision guides securely.

### 📢 Announcements & Campus Bulletin
* Real-time notifications and broadcasts for crucial administrative announcements, university circulars, and departmental updates.

### 📅 Events Hub
* Find and keep track of upcoming campus events, club activities, guest lectures, and student meetups with full detail views.

### 🔍 Lost & Found Board
* A digital lost-and-found system for students to post, track, and retrieve misplaced items on campus safely.

### 🔐 Enterprise-Grade Security
* **JWT Authentication**: Secure user session handshakes with JSON Web Tokens.
* **Data Persistence**: Credentials and session tokens securely saved using `expo-secure-store` on the device.

---

## 🛠️ Technology Stack

### Frontend (Client)
* **Framework**: React Native & Expo (v54 SDK)
* **Navigation**: React Navigation (Native Stack, Bottom Tabs)
* **Styling**: Vanilla React Native StyleSheet & TailwindCSS utilities
* **State & Networking**: Axios with custom interceptors for Bearer Token injection
* **Rich Media**: Expo Image, Expo Image Picker, Expo Sharing, Expo Document Picker

### Backend (Server)
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose Object Modeling)
* **Media Storage**: AWS S3 Storage integration (via `@aws-sdk/client-s3`) & local Multer uploads
* **Mailer**: Nodemailer (SMTP integration for notifications & confirmation)
* **Security**: Bcryptjs password hashing, JWT authorization middleware

---

## 🚀 Setup & Installation Instructions

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) and [Git](https://git-scm.com/) installed.

### 1. Clone the Repository
```bash
git clone https://github.com/bimsara2003/uniSync-mobileApp.git
cd uniSync-mobileApp
```

---

### 2. Backend Server Setup

Navigate into the server folder:
```bash
cd server
```

Install backend dependencies:
```bash
npm install
```

Create a `.env` file in the `server/` directory and configure the environment variables:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/unisync
JWT_SECRET=your_super_secret_jwt_key

# Optional: AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region

# Optional: Nodemailer Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
```

Start the backend development server:
```bash
npm run dev
```
The server will boot up and listen on `http://localhost:5000` (or your chosen PORT).

---

### 3. Frontend Client Setup

Navigate to the client folder (from the repository root):
```bash
cd client
```

Install frontend dependencies:
```bash
npm install
```

Create a `.env` file in the `client/` directory and configure the server API URL (use your local IP address for physical device testing instead of `localhost`):
```env
EXPO_PUBLIC_API_URL=http://<your-local-ip-address>:5000
```

Start the Metro Bundler:
```bash
npx expo start
```
Scan the QR code printed in your terminal using the **Expo Go** application (available on iOS App Store and Android Play Store) to launch UniSync directly on your physical device, or press `a` for Android Emulator / `i` for iOS Simulator.

---

## 📂 Project Structure

```
uniSync-mobileApp/
├── client/                     # React Native Expo Frontend
│   ├── assets/                 # App icons, splash screens, and images
│   ├── src/
│   │   ├── api/                # API client endpoints (axios configurations)
│   │   ├── components/         # Reusable Custom Components (e.g., DatePickerModal)
│   │   ├── context/            # React Context API providers (Auth, Theme)
│   │   ├── navigation/         # Navigation navigators & route configuration
│   │   └── screens/            # Application Screen Components (Portfolio, Resources, LostFound, etc.)
│   ├── App.js                  # App Entry Point
│   ├── package.json            
│   └── tailwind.config.js      
│
└── server/                     # Node.js Express Backend
    ├── config/                 # DB connections & S3 storage setup
    ├── controllers/            # Controller logic for endpoints
    ├── middleware/             # Authentication & authorization filters
    ├── models/                 # Mongoose schemas (User, PortfolioItem, Event, etc.)
    ├── routes/                 # Express REST API routes
    ├── utils/                  # Helper utilities (Email, Token generation)
    ├── server.js               # Express entry script
    └── package.json            
```

---

## 📝 License

Distributed under the **ISC License**. See the `LICENSE` file for more details.

## 👥 Development Team & Contributors

This project was successfully designed, developed, and maintained as a collaborative group effort under Group ID **WMT_AI_KU_07**:

| IT Number | Name | Function / Module |
| :--- | :--- | :--- |
| **IT24104181** (Leader) | Alahakoon A.M.D.S | Event Management |
| **IT24103190** | Wijewantha W.K.S.B | Resource Sharing |
| **IT24104333** | Bandara H.L.K.G. | Announcements |
| **IT24100367** | Ranasinghe A.R.P.G.S.U | Lost & Found |
| **IT24610808** | Ekanayaka E.W.M.W.W.T.D.E | Student Portfolio |

---

### Developed with ❤️ by the UniSync Group
For support or inquiries, please contact the repository maintainers or raise an issue.

