// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJoL4v4sXojGDbh0rD_DkqbyqhZEo7CbY",
  authDomain: "iot-poultry-10f80.firebaseapp.com",
  projectId: "iot-poultry-10f80",
  storageBucket: "iot-poultry-10f80.firebasestorage.app",
  messagingSenderId: "377774988127",
  appId: "1:377774988127:web:24b2a8e0e74854e9c574ea",
  measurementId: "G-3H4M2FV1XK" // You can leave this even if unused
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
