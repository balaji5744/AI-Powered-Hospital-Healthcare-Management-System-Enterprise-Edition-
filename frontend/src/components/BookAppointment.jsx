import React, { useState } from "react";
import {
  useDepartments,
  useAvailableSlots,
  useBookAppointment,
} from "../api/hooks";
import { format } from "date-fns";

const BookAppointment = ({ onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    department: "",
    doctor_id: "",
    doctor_name: "",
    appointment_date: "",
    time_slot: "",
  });

  const { data: departmentsData, isLoading: deptsLoading } = useDepartments();
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(
    formData.doctor_id,
    formData.appointment_date,
  );
  const bookMutation = useBookAppointment();

  // Find the doctors for the currently selected department
  const selectedDept = departmentsData?.find(
    (d) => d.department === formData.department,
  );

  const handleSubmit = async () => {
    await bookMutation.mutateAsync({
      doctor_id: formData.doctor_id,
      department: formData.department,
      appointment_date: formData.appointment_date,
      time_slot: formData.time_slot,
    });
    onCancel(); // Close the wizard after booking
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Book an Appointment (Step {step} of 4)
          </h2>
          <button
            onClick={onCancel}
            className="text-white hover:text-gray-200 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="p-6 min-h-[300px]">
          {/* STEP 1: Select Department */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Select a Department
              </h3>
              {deptsLoading ? (
                <p>Loading departments...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {departmentsData?.map((dept) => (
                    <button
                      key={dept.department}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          department: dept.department,
                        });
                        setStep(2);
                      }}
                      className="p-4 border rounded hover:border-blue-500 hover:bg-blue-50 text-left transition"
                    >
                      {dept.department}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Select Doctor */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Select a Doctor ({formData.department})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedDept?.doctors?.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        doctor_id: doc.id,
                        doctor_name: doc.name,
                      });
                      setStep(3);
                    }}
                    className="p-4 border rounded hover:border-blue-500 hover:bg-blue-50 text-left transition"
                  >
                    {doc.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-6 text-gray-500 hover:underline"
              >
                ← Back to Departments
              </button>
            </div>
          )}

          {/* STEP 3: Select Date & Time */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Select Date & Time for {formData.doctor_name}
              </h3>
              <input
                type="date"
                className="w-full p-2 border rounded mb-6"
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, appointment_date: e.target.value })
                }
              />

              {formData.appointment_date && (
                <div>
                  <h4 className="font-medium mb-3">Available Time Slots:</h4>
                  {slotsLoading ? (
                    <p>Checking doctor's calendar...</p>
                  ) : slots?.length === 0 ? (
                    <p className="text-red-500">
                      No slots available on this date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                      {slots?.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            setFormData({ ...formData, time_slot: slot });
                            setStep(4);
                          }}
                          className="p-2 border rounded text-center hover:bg-blue-500 hover:text-white transition"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setStep(2)}
                className="mt-6 text-gray-500 hover:underline"
              >
                ← Back to Doctors
              </button>
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {step === 4 && (
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">
                Confirm Your Appointment
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg inline-block text-left border mb-6 w-full max-w-md">
                <p className="mb-2">
                  <strong>Doctor:</strong> {formData.doctor_name}
                </p>
                <p className="mb-2">
                  <strong>Department:</strong> {formData.department}
                </p>
                <p className="mb-2">
                  <strong>Date:</strong> {formData.appointment_date}
                </p>
                <p>
                  <strong>Time:</strong> {formData.time_slot}
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 border rounded hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={bookMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {bookMutation.isPending ? "Booking..." : "Confirm & Book"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
