import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";

// Route Protector Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Wrap protected routes inside the DashboardLayout.
            React Router will automatically inject these into the <Outlet /> 
          */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={<Dashboard />} />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={<Dashboard />} />

            {/* Add more routes here later (e.g., /patient/appointments) */}
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
