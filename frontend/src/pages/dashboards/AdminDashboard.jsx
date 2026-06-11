import React from "react";
import { useAdminStats } from "../../api/hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) return <div className="p-8">Loading system analytics...</div>;

  const chartData = [
    { name: "Cardiology", patients: 120 },
    { name: "Neurology", patients: 85 },
    { name: "Pediatrics", patients: 150 },
    { name: "General", patients: 200 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Hospital Administrator Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">
            Total Users
          </h3>
          <p className="text-3xl font-bold">{stats?.users?.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">
            Total Doctors
          </h3>
          <p className="text-3xl font-bold">
            {stats?.users?.by_role?.doctor || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">
            Total Patients
          </h3>
          <p className="text-3xl font-bold">
            {stats?.users?.by_role?.patient || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">
            Appointments
          </h3>
          <p className="text-3xl font-bold">
            {stats?.appointments?.total || 0}
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          Department Patient Volume
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="patients" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
