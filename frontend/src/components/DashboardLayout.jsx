import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Pill,
  Activity,
  LogOut,
  Settings,
} from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Define navigation links based on role (you can expand this later)
  const navLinks = [
    {
      name: "Dashboard",
      path: `/${user?.role}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: "Appointments",
      path: `/${user?.role}/appointments`,
      icon: CalendarDays,
    },
    { name: "Medical Records", path: `/${user?.role}/records`, icon: Users },
    { name: "Pharmacy", path: `/${user?.role}/pharmacy`, icon: Pill },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 bg-slate-950/50 border-b border-slate-800">
          <Activity className="h-6 w-6 text-brand-500 mr-3" />
          <span className="text-white font-bold text-lg tracking-wide">
            HospitalOS
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Settings Link */}
        <div className="p-3 border-t border-slate-800">
          <NavLink
            to={`/${user?.role}/settings`}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {user?.role} Portal
          </h1>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">
                {user?.email}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border border-brand-200">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT GOES HERE */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="max-w-7xl mx-auto">
            {/* The Outlet is where the React Router renders the actual page */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
