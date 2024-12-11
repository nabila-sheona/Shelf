// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMaDzIJDAV7WV-UquBg6FQOkOrsmqJ9WQ",
  authDomain: "whiskersnco.firebaseapp.com",
  projectId: "whiskersnco",
  storageBucket: "whiskersnco.appspot.com",
  messagingSenderId: "1060312703913",
  appId: "1:1060312703913:web:dc67e9932f43e3888f9ab8",
  measurementId: "G-M02VGYLTRZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
