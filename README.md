# STUNOTES

STUNOTES is a notes-sharing web application built using React and Firebase.  
All backend services are handled using Firebase (Backend as a Service).

---

## Project Structure

STUNOTES/ <br>
 ├── frontend/     (React application) <br>
 ├── backend/      (Empty - Firebase is used as backend)<br>
 └── README.md

Note: This project does not use a traditional Node/Express backend. Firebase handles authentication, database, and storage.

---

## Backend (Firebase)

Firebase is used for:

- Authentication (Google Sign-In)
- Firestore Database
- Cloud Storage (Optional)

The backend folder is currently empty and is reserved for future use.

---

## Environment Setup

Firebase configuration is stored in environment variables.

An example file is provided at:

frontend/.env.example

To run the project:

1. Go to frontend folder

cd frontend

2. Copy example file

cp .env.example .env

3. Open .env and add your Firebase API keys

REACT_APP_FIREBASE_API_KEY=your_api_key_here  
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_here  
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here  
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here  
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here  
REACT_APP_FIREBASE_APP_ID=your_app_id_here  

Do NOT upload .env to GitHub. It is ignored for security.

---

## How to Run

1. Install dependencies

cd frontend  
npm install

2. Start project

npm start

The app will run on:

http://localhost:3000

---

## Tech Stack

Frontend: React  
Backend: Firebase (Auth, Firestore, Storage)  
Database: Firestore  

---

## Notes

- No custom backend server is used.
- Firebase handles all backend functionality.
- Backend folder is kept for future scalability.

---

## License

This project is created for educational purposes.
