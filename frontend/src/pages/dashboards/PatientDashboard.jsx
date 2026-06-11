import React, { useState } from "react";
import { useMyAppointments } from "../../api/hooks";
import { CalendarPlus, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

import BookAppointment from "../../components/BookAppointment";

// ========================================================
// CRASH-PROOF DATE FORMATTER
// Prevents the "White Screen of Death" if dates are malformed
// ========================================================
const getSafeDate = (dateString) => {
  if (!dateString) return "TBD";
  try {
    const d = new Date(dateString);
    // If it's an invalid date, return a fallback instead of crashing
    if (isNaN(d.getTime())) return dateString;
    return format(d, "MMM dd, yyyy");
  } catch (error) {
    return "Pending Date";
  }
};

export default function PatientDashboard() {
  const { data: appointments, isLoading } = useMyAppointments();
  const [isBooking, setIsBooking] = useState(false);

  if (isLoading)
    return (
      <div className="text-slate-500 animate-pulse">
        Loading your health records...
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Header & CTA */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Appointments</h2>
        </div>
        <button
          onClick={() => setIsBooking(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <CalendarPlus className="h-5 w-5 mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4 font-semibold">Date & Time</th>
              <th className="px-6 py-4 font-semibold">Department</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!appointments || appointments.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  You have no upcoming appointments.
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr
                  key={appt.id || appt._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-800 font-medium">
                      <Clock className="h-4 w-4 mr-2 text-slate-400" />

                      {/* FIX: Using the safe formatter here! */}
                      {getSafeDate(appt.appointment_date)}

                      <span className="ml-2 text-slate-500 font-normal">
                        at {appt.time_slot}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-600">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      {appt.department}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        appt.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : appt.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {appt.status || "SCHEDULED"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* RENDER YOUR WIZARD */}
      {isBooking && <BookAppointment onCancel={() => setIsBooking(false)} />}
    </div>
  );
}
