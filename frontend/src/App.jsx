import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup"; // 1. IMPORT SIGNUP
import Dashboard from "./pages/Dashboard";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading HospitalOS...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Core Routes */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* 2. REGISTER THE SIGNUP ROUTE */}
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      {/* Protected Dashboards Engine */}
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
