<p align="center">
  <h1 align="center">📚 StuNotes — Cloud Notes & Study Platform</h1>
  <p align="center">
    A full-stack collaborative platform for students to upload, share, and organize notes — powered by AI, real-time chat, and smart assessments.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/AWS_S3-Storage-FF9900?logo=amazon-s3&logoColor=white" alt="AWS S3" />
  <img src="https://img.shields.io/badge/Socket.IO-Real--time-010101?logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google&logoColor=white" alt="Google AI" />
</p>

---

## ✨ Features

| Category | Feature | Description |
|----------|---------|-------------|
| 📝 **Notes** | Upload & Share | Upload notes (PDF, DOCX, PPTX) and share with the community |
| 📝 **Notes** | View & Search | Browse, search, and filter shared notes |
| 🤖 **AI** | Academic AI Chat | AI-powered study assistant using Google Gemini for academic Q&A |
| 📊 **AI** | AI Insights | Intelligent analytics and study recommendations via Recharts |
| 📝 **Assessments** | Create & Take Quizzes | Create assessments with multiple question types, take tests in focus mode |
| 👥 **Collaboration** | Study Groups | Create/join study groups with shared workspaces |
| 💬 **Collaboration** | Real-time Chat | Instant messaging within study groups via Socket.IO |
| 🎙️ **Collaboration** | Voice Chat | WebRTC-based peer-to-peer voice calls in groups |
| 📅 **Productivity** | Calendar | Track deadlines, events, and study schedules |
| 👤 **User** | Profiles & Auth | Firebase-powered authentication with user profiles |
| 🔔 **User** | Dashboard | Personalized dashboard with alerts, recent activity, and quick actions |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — Modern UI with hooks and functional components
- **React Router 7** — Client-side routing with nested layouts
- **Recharts** — Data visualization and analytics charts
- **Socket.IO Client** — Real-time bidirectional communication
- **React Markdown** — Render AI responses with rich formatting
- **React Icons** — Comprehensive icon library
- **Firebase SDK** — Authentication (Google Sign-In, Email/Password)

### Backend
- **Node.js + Express 5** — RESTful API server
- **MongoDB + Mongoose 9** — NoSQL database with schema validation
- **Socket.IO** — Real-time chat and voice signaling
- **Firebase Admin SDK** — Server-side token verification
- **AWS S3** — Cloud file storage for uploaded notes
- **Google Generative AI (Gemini)** — AI-powered academic assistant
- **Multer + Multer-S3** — Multipart file upload handling
- **pdf-parse / Mammoth / pptx-parser** — Document content extraction

---

## 📁 Project Structure

```
Cloud_Notes-Sharing_platform/
├── backend/
│   ├── index.js                 # Express + Socket.IO entry point
│   └── src/
│       ├── config/              # DB, Firebase, S3, Gemini configs
│       ├── controllers/         # Route handlers
│       ├── middleware/          # Auth middleware, file upload
│       ├── models/              # Mongoose schemas
│       ├── routes/              # Express route definitions
│       ├── services/            # AI service layer
│       └── sockets/             # Socket.IO event handlers
│
├── frontend/src/
│   ├── index.js                 # React entry point
│   ├── app/                     # App.js (routing)
│   ├── assets/                  # Images and static files
│   ├── services/                # Axios API client, Firebase config
│   ├── shared/                  # Layout, MiniCalendar
│   ├── utils/                   # Utility functions
│   └── features/
│       ├── auth/                # Login, Register
│       ├── dashboard/           # Dashboard
│       ├── notes/               # ViewNotes, UploadModal, NoteContext
│       ├── groups/              # StudyGroups, GroupPage, GroupChat
│       ├── assessments/         # Assessments, TakeAssessment, TestWindow
│       ├── calendar/            # Calendar
│       ├── ai/                  # AcademicAI, ChatMessage, ModeSelector
│       ├── profile/             # Profile
│       └── landing/             # Landing, About, Contact, Privacy, Terms
└── package.json                 # Root scripts (concurrent dev)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster
- **Firebase Project** — [Create one here](https://console.firebase.google.com/)
- **AWS Account** — S3 bucket for file storage

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Cloud_Notes-Sharing_platform.git
cd Cloud_Notes-Sharing_platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5050
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stunotes
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```

> 💡 A `.env.example` file is provided for reference.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Application

**Start both services** (from root directory):

```bash
# Terminal 1 — Backend
npm run backend

# Terminal 2 — Frontend
npm run frontend
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000         |
| Backend  | http://localhost:5050         |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/notes` | Notes CRUD operations |
| `GET/POST` | `/api/groups` | Study group management |
| `POST` | `/api/upload` | File upload to S3 |
| `GET/PUT` | `/api/users` | User profile operations |
| `POST` | `/api/academic-chat` | AI academic assistant |
| `GET/POST` | `/api/assessments` | Assessment & quiz management |

### Real-time Events (Socket.IO)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_group` | Client → Server | Join a group's chat room |
| `send_message` | Client → Server | Send a chat message |
| `receive_message` | Server → Client | Receive a new message |
| `edit_message` | Client → Server | Edit an existing message |
| `delete_message` | Client → Server | Delete a message |
| `join_voice` | Client → Server | Join a voice call room |
| `offer` / `answer` / `ice-candidate` | Peer ↔ Peer | WebRTC voice signaling |

---

## 🔐 Environment Variables

> ⚠️ **Never commit `.env` files to version control.** Both `.env` files are included in `.gitignore`.

<details>
<summary><strong>Backend Variables</strong></summary>

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `5050`) |
| `MONGO_URI` | MongoDB connection string |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | AWS S3 bucket region |
| `AWS_BUCKET_NAME` | S3 bucket name for file storage |

</details>

<details>
<summary><strong>Frontend Variables</strong></summary>

| Variable | Description |
|----------|-------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID |

</details>

---

## 📂 Data Models

| Model | Key Fields | Purpose |
|-------|------------|---------|
| **User** | `uid`, `name`, `email` | User account information |
| **Note** | `title`, `subject`, `fileUrl`, `uploadedBy` | Uploaded study notes |
| **Group** | `name`, `members`, `createdBy` | Study group metadata |
| **Chat** | `groupId`, `senderId`, `message`, `messageType` | Group chat messages (text & audio) |
| **Assessment** | `title`, `questions`, `createdBy` | Quizzes and assessments |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is created for **educational purposes**.

---

<p align="center">
  Made with ❤️ for students, by students
</p>
