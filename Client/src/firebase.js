// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVOoqwtV9WM5vC_FId2R1ME5iLY6IEub8",
  authDomain: "shelf-bdd58.firebaseapp.com",
  projectId: "shelf-bdd58",
  storageBucket: "shelf-bdd58.firebasestorage.app",
  messagingSenderId: "935609097714",
  appId: "1:935609097714:web:1c07370808508a95629f6b",
  measurementId: "G-697HEGFK4M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
export { auth, provider, githubProvider, signInWithPopup };
//https://shelf-bdd58.firebaseapp.com/__/auth/handler
