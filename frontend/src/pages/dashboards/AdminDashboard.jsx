import React from "react";
import { useAdminStats } from "../../api/hooks";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Users,
  Calendar,
  ShieldCheck,
  Activity,
  DollarSign,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: response, isLoading } = useAdminStats();
  const stats = response?.data;

  if (isLoading)
    return (
      <div className="p-6 text-slate-500 animate-pulse font-medium">
        Assembling operational system intelligence...
      </div>
    );

  // Re-map the real database counts dynamically into Recharts compatible arrays
  const graphData = [
    { name: "Patients", count: stats?.users?.by_role?.patient || 0 },
    { name: "Doctors", count: stats?.users?.by_role?.doctor || 0 },
    { name: "Appointments", count: stats?.appointments?.total || 0 },
    {
      name: "Today Queue",
      count: stats?.appointments?.appointments_today || 0,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Hospital Administration Workbench
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time core hospital operational analytics ledger indicators.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Total Registry
            </span>
            <span className="text-xl font-bold text-slate-800">
              {stats?.users?.total || 0} Accounts
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Today's Visits
            </span>
            <span className="text-xl font-bold text-slate-800">
              {stats?.appointments?.appointments_today || 0} Cases
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Bed Occupancy
            </span>
            <span className="text-xl font-bold text-slate-800">
              {stats?.hospital_operations?.bed_occupancy || "0%"}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Revenue Today
            </span>
            <span className="text-xl font-bold text-slate-800">
              {stats?.hospital_operations?.revenue_today || "₹0"}
            </span>
          </div>
        </div>
      </div>

      {/* 📊 DYNAMIC RECHARTS VISUALIZATION GRAPH BLOCK */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" /> System Metrics
          Performance Summary
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "11px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
