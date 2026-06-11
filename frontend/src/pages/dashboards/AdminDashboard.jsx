import React from "react";
import { useAdminStats } from "../../api/hooks";
import { Users, Activity, Calendar, Stethoscope } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useAdminStats();

  if (isLoading)
    return (
      <div className="text-slate-500 animate-pulse">
        Loading system analytics...
      </div>
    );
  if (isError)
    return <div className="text-red-500">Failed to load statistics.</div>;

  // Fallback data if API is still empty
  const chartData = [
    { name: "Cardiology", patients: 120 },
    { name: "Neurology", patients: 85 },
    { name: "Pediatrics", patients: 150 },
    { name: "General", patients: 200 },
  ];

  const kpiCards = [
    {
      title: "Total Users",
      value: stats?.users?.total || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Doctors",
      value: stats?.users?.by_role?.doctor || 0,
      icon: Stethoscope,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Patients",
      value: stats?.users?.by_role?.patient || 0,
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Appointments",
      value: stats?.appointments?.total || 0,
      icon: Calendar,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${card.bg}`}
                >
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">
          Department Patient Volume
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b" }}
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
