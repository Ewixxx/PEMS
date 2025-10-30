import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; // adjust path if needed

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        user.getIdToken().then((token) => localStorage.setItem("accessToken", token));
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; // or a spinner/loading component

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return children;
}
