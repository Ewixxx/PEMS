import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/landing", { replace: true });
    }
  }, [navigate]);

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✅ Store token for cross-tab persistence
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("accessToken", token);

      alert("✅ Registered successfully!");
      navigate("/landing", { replace: true });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/video/farm.mp4"
        type="video/mp4"
        autoPlay
        muted
        loop
      />
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative flex items-center justify-center min-h-screen px-4">
        <div className="bg-gray-900 bg-opacity-90 text-white rounded-lg p-8 w-full max-w-sm shadow-lg shadow-green-500/40">
          <h2 className="text-2xl font-bold text-green-300 text-center mb-6">
            Create Account
          </h2>

          <input
            className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded transition"
            onClick={handleRegister}
          >
            Sign Up
          </button>

          <p className="text-center mt-4 text-sm text-gray-300">
            Already have an account?{" "}
            <button
              className="text-green-300 underline"
              onClick={() => navigate("/")}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
