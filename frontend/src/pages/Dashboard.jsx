import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Clock,
  FileText,
  Pill,
  ChevronRight,
  Stethoscope,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  // Mock data for the table - in the future, this will come from your backend!
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Jenkins",
      specialty: "Cardiologist",
      date: "June 12, 2026",
      time: "10:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "General Practice",
      date: "June 15, 2026",
      time: "2:30 PM",
      status: "Pending",
    },
    {
      id: 3,
      doctor: "Dr. Emily Torres",
      specialty: "Dermatologist",
      date: "June 28, 2026",
      time: "11:15 AM",
      status: "Confirmed",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.email?.split("@")[0]}!
          </h2>
          <p className="text-slate-500 mt-2 text-lg">
            You have{" "}
            <span className="font-semibold text-brand-600">
              2 upcoming appointments
            </span>{" "}
            this week.
          </p>
        </div>
        {/* Decorative Background Element */}
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-brand-50 to-transparent pointer-events-none" />
        <Stethoscope className="h-32 w-32 text-brand-100 absolute -right-4 -bottom-4 transform rotate-12 pointer-events-none z-0" />
      </div>

      {/* 2. Quick Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
              Up to date
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">
            Upcoming Appointments
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-800">2</p>
            <p className="text-sm text-slate-500">scheduled</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
              1 Action needed
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Lab Results</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-800">4</p>
            <p className="text-sm text-slate-500">records</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Pill className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">
            Active Prescriptions
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-800">1</p>
            <p className="text-sm text-slate-500">needs refill soon</p>
          </div>
        </div>
      </div>

      {/* 3. Data Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Your Schedule
          </h3>
          <button className="text-sm text-brand-600 font-medium hover:text-brand-700 flex items-center">
            View full calendar <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingAppointments.map((apt) => (
                <tr
                  key={apt.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {apt.doctor}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{apt.specialty}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-700">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      {apt.date}
                      <Clock className="h-4 w-4 ml-3 mr-1.5 text-slate-400" />
                      {apt.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        apt.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-brand-600 hover:text-brand-800 font-medium text-sm">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
