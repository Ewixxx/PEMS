import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./login";
import Register from "./register";
import Landing from "./landing";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/landing"
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
