import React, { useState } from "react";
import { useMyAppointments } from "../../api/hooks";
import { format } from "date-fns";
import BookAppointment from "../../components/BookAppointment";

const PatientDashboard = () => {
  const { data: appointments, isLoading } = useMyAppointments();
  const [isBooking, setIsBooking] = useState(false);

  if (isLoading)
    return (
      <div className="p-8 text-gray-500">Loading your health records...</div>
    );

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-6">Patient Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">
            Total Appointments
          </h3>
          <p className="text-3xl font-bold">{appointments?.length || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">My Appointments</h2>
          <button
            onClick={() => setIsBooking(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Book Appointment
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="p-4">Date</th>
              <th className="p-4">Time Slot</th>
              <th className="p-4">Department</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments?.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No appointments found.
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
                  <td className="p-4 font-medium text-gray-900">
                    {appt.time_slot}
                  </td>
                  <td className="p-4">{appt.department}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${appt.status === "COMPLETED" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                    >
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isBooking && <BookAppointment onCancel={() => setIsBooking(false)} />}
    </div>
  );
};

export default PatientDashboard;
