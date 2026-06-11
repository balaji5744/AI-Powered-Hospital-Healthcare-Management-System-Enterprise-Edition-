import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PatientDashboard from "./dashboards/PatientDashboard";
import PatientProfile from "./dashboards/PatientProfile"; // 1. IMPORT PATIENT PROFILE
import DoctorDashboard from "./dashboards/DoctorDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Activity,
  UserCircle,
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();

  // 2. ACTIVE NAVIGATION STATE
  const [activeTab, setActiveTab] = useState("Overview");

  if (!user) return null;

  const roleKey = ["super_admin", "hospital_admin", "admin"].includes(user.role)
    ? "admin"
    : user.role;

  // Sidebar Links
  const navLinks = {
    admin: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "Manage Doctors", icon: Users },
      { name: "Manage Patients", icon: Users },
      { name: "System Settings", icon: Settings },
    ],
    doctor: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "My Schedule", icon: Calendar },
      { name: "Patient Records", icon: FileText },
    ],
    patient: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "My Profile", icon: UserCircle }, // Updated tab name
    ],
  };

  const currentLinks = navLinks[roleKey] || [];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Activity className="h-6 w-6 text-blue-500 mr-2" />
          <span className="text-white font-bold text-lg tracking-wide">
            Hospital<span className="text-blue-500">OS</span>
          </span>
        </div>

        {/* Dynamic Links Menu */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-3">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.name; // Checks state

              return (
                <li key={link.name}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(link.name)} // 3. CAPTURES NAVIGATION INTERACTION
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md font-semibold"
                        : "hover:bg-slate-800 hover:text-white font-medium"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 mr-3 transition-colors ${isActive ? "text-white" : "text-slate-400"}`}
                    />
                    <span className="text-sm">{link.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold uppercase">
              {user.email.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {user.email}
              </p>
              <p className="text-xs text-blue-400 uppercase font-semibold tracking-wider">
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-800">
            {activeTab} -{" "}
            {roleKey === "admin"
              ? "Administrator Portal"
              : roleKey === "doctor"
                ? "Doctor Portal"
                : "Patient Portal"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">
              System Online
            </span>
          </div>
        </header>

        {/* Content View Router Injection */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {(() => {
              // PATIENT CORE SWITCHING ROUTER ENGINE
              if (user.role === "patient") {
                switch (activeTab) {
                  case "My Profile":
                    return <PatientProfile />;
                  case "Overview":
                  default:
                    return <PatientDashboard />;
                }
              }

              // DOCTOR CORE SWITCHING ROUTER ENGINE
              if (user.role === "doctor") {
                return <DoctorDashboard />;
              }

              // ADMIN CORE SWITCHING ROUTER ENGINE
              if (
                ["admin", "hospital_admin", "super_admin"].includes(user.role)
              ) {
                return <AdminDashboard />;
              }

              return (
                <div className="p-8 text-center text-red-500">
                  Access Restricted.
                </div>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
