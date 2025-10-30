import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
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

  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();

      // ✅ Store token in localStorage for cross-tab persistence
      localStorage.setItem("accessToken", token);

      navigate("/landing", { replace: true });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center relative">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="/video/farm.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative bg-black bg-opacity-70 p-8 rounded-xl shadow-lg text-white w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-gray-800"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded bg-gray-800"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-600 p-2 rounded"
        >
          Login
        </button>
        <p className="mt-3 text-center text-sm">
          No account?{" "}
          <Link to="/register" className="text-green-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
