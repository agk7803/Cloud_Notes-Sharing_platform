
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDU1O5uPatpBXGg6FNpyEQTJVJ0cxte-LA",
  authDomain: "stunotes-c9a11.firebaseapp.com",
  projectId: "stunotes-c9a11",
  storageBucket: "stunotes-c9a11.firebasestorage.app",
  messagingSenderId: "155491108477",
  appId: "1:155491108477:web:88be8d85ae3a773f159314"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();