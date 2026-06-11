import React from "react";
import { useMyAppointments } from "../../api/hooks";
import { format } from "date-fns";

const DoctorDashboard = () => {
  const { data: appointments, isLoading } = useMyAppointments();

  if (isLoading)
    return <div className="p-8 text-gray-500">Loading your schedule...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Doctor Dashboard</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            My Appointment Queue
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-gray-600 text-sm border-b">
              <th className="p-4">Date</th>
              <th className="p-4">Time</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments?.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No appointments scheduled.
                </td>
              </tr>
            ) : (
              appointments?.map((appt) => (
                <tr
                  key={appt._id || appt.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4">
                    {appt.appointment_date
                      ? format(new Date(appt.appointment_date), "MMM dd, yyyy")
                      : "No Date"}
                  </td>
                  <td className="p-4 font-medium">{appt.time_slot}</td>
                  <td className="p-4 text-sm">{appt.status}</td>
                  <td className="p-4">
                    {appt.status !== "COMPLETED" ? (
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition">
                        Start Consultation
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorDashboard;
