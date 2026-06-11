import React, { useState } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  HeartPulse,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Search,
} from "lucide-react";
import { useBookAppointment, useDoctorsByDepartment } from "../api/hooks";

// Smart disease/symptom mapping index
const SYMPTOM_MATRIX = [
  { disease: "Chest Pain / Palpitations", department: "Cardiology" },
  { disease: "High Blood Pressure", department: "Cardiology" },
  { disease: "Migraines / Seizures / Numbness", department: "Neurology" },
  { disease: "Memory Loss / Tremors", department: "Neurology" },
  { disease: "Child Fever / Growth Check", department: "Pediatrics" },
  { disease: "Infant Vaccinations", department: "Pediatrics" },
  { disease: "General Fever / Cough / Cold", department: "General Practice" },
  { disease: "Routine Health Checkup", department: "General Practice" },
];

export default function BookAppointment({ onCancel }) {
  const { mutateAsync: submitBooking } = useBookAppointment();

  // Wizard state controls
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSymptomHelper, setShowSymptomHelper] = useState(false);

  // Form State Memory
  const [formData, setFormData] = useState({
    department: "",
    doctor_id: "",
    doctor_name: "", // Kept for the review card display
    appointment_date: "",
    time_slot: "",
    reason: "",
  });

  // Fetch real doctors automatically whenever the department updates
  const { data: doctorsList, isLoading: loadingDoctors } =
    useDoctorsByDepartment(formData.department);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "department") {
      // Reset doctor elements if department changes mid-flow
      setFormData((prev) => ({
        ...prev,
        department: value,
        doctor_id: "",
        doctor_name: "",
      }));
    } else if (name === "doctor_id") {
      const selectedDoc = doctorsList?.find(
        (doc) => doc.id === value || doc._id === value,
      );
      setFormData((prev) => ({
        ...prev,
        doctor_id: value,
        doctor_name: selectedDoc ? `Dr. ${selectedDoc.name}` : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Automated mapping handler from symptom selector
  const handleSymptomSelect = (department) => {
    setFormData((prev) => ({
      ...prev,
      department,
      doctor_id: "",
      doctor_name: "",
    }));
    setShowSymptomHelper(false);
    setApiError("");
  };

  const nextStep = () => {
    setApiError("");
    if (step === 1 && (!formData.department || !formData.reason)) {
      setApiError("Please choose a department and describe your symptoms.");
      return;
    }
    if (
      step === 2 &&
      (!formData.doctor_id || !formData.appointment_date || !formData.time_slot)
    ) {
      setApiError("Please select a doctor, available date, and time slot.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setApiError("");
    setStep((prev) => prev - 1);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setApiError("");
    try {
      await submitBooking({
        department: formData.department,
        doctor_id: formData.doctor_id, // Dynamically pulled straight from your select option payload
        appointment_date: formData.appointment_date,
        time_slot: formData.time_slot,
        reason: formData.reason,
      });

      setIsSuccess(true);
      setTimeout(() => onCancel(), 2500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      let msg = "Failed to book appointment. Please try again.";
      if (Array.isArray(detail)) {
        msg = `Invalid input for '${detail[0].loc[detail[0].loc.length - 1]}': ${detail[0].msg}`;
      } else if (typeof detail === "string") {
        msg = detail;
      }
      setApiError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
            Book Consultation
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8 animate-in scale-in duration-300">
              <div className="mx-auto h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <HeartPulse className="h-10 w-10 text-emerald-600 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                Booking Confirmed!
              </h3>
              <p className="text-slate-500 mt-2">
                Your consultation data was successfully logged.
              </p>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-center mb-6">
                {[1, 2, 3].map((num) => (
                  <React.Fragment key={num}>
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        step >= num
                          ? "bg-blue-600 text-white shadow"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {num}
                    </div>
                    {num !== 3 && (
                      <div
                        className={`h-1 w-16 mx-2 rounded ${step > num ? "bg-blue-600" : "bg-slate-100"}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {apiError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
                  {apiError}
                </div>
              )}

              <div className="min-h-[260px]">
                {/* STEP 1: Department & Symptom Helper */}
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-bold text-slate-800">
                        Choose Medical Field
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowSymptomHelper(!showSymptomHelper)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 underline"
                      >
                        <Search className="h-3 w-3" /> Don't know your
                        department?
                      </button>
                    </div>

                    {showSymptomHelper && (
                      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-2 max-h-40 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs font-semibold text-blue-800 mb-1">
                          Select your symptom or known condition:
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {SYMPTOM_MATRIX.map((item, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() =>
                                handleSymptomSelect(item.department)
                              }
                              className="text-left text-xs bg-white hover:bg-blue-600 hover:text-white p-2 rounded-md border border-slate-200/60 shadow-sm font-medium transition-all"
                            >
                              {item.disease} →{" "}
                              <span className="italic font-bold">
                                {item.department}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
                        Department
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-medium text-slate-700"
                      >
                        <option value="">-- Select Department --</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="General Practice">
                          General Practice
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
                        Reason for Visit
                      </label>
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none text-sm text-slate-700"
                        placeholder="E.g., Severe chest heavy feelings, routine prescription renewal, etc."
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Real Doctors & Schedule */}
                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold text-slate-800">
                      Select Professional & Time
                    </h3>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
                        Available Doctors ({formData.department})
                      </label>
                      <select
                        name="doctor_id"
                        value={formData.doctor_id}
                        onChange={handleChange}
                        disabled={loadingDoctors}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-medium text-slate-700 disabled:bg-slate-50"
                      >
                        <option value="">
                          {loadingDoctors
                            ? "Searching clinical staff..."
                            : "-- Select Assigned Doctor --"}
                        </option>
                        {doctorsList?.map((doc) => (
                          <option
                            key={doc.id || doc._id}
                            value={doc.id || doc._id}
                          >
                            Dr. {doc.name || doc.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
                          Appointment Date
                        </label>
                        <input
                          type="date"
                          name="appointment_date"
                          min={new Date().toISOString().split("T")[0]}
                          value={formData.appointment_date}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
                          Time Slot
                        </label>
                        <select
                          name="time_slot"
                          value={formData.time_slot}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-medium text-slate-700"
                        >
                          <option value="">-- Select Time --</option>
                          <option value="09:00 AM">09:00 AM (Free)</option>
                          <option value="10:00 AM">10:00 AM (Free)</option>
                          <option value="11:00 AM">11:00 AM (Free)</option>
                          <option value="02:00 PM">02:00 PM (Free)</option>
                          <option value="03:00 PM">03:00 PM (Free)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Verification Check */}
                {step === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold text-slate-800">
                      Review Booking Specifications
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3 shadow-inner">
                      <div className="flex items-center text-sm text-slate-600">
                        <Stethoscope className="h-4 w-4 mr-3 text-blue-500 shrink-0" />
                        <span className="font-semibold w-24">Consultant:</span>
                        <span className="text-slate-900 font-medium">
                          {formData.doctor_name || "Assigned Medical Officer"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <HeartPulse className="h-4 w-4 mr-3 text-blue-500 shrink-0" />
                        <span className="font-semibold w-24">Department:</span>
                        <span className="text-slate-900 font-medium">
                          {formData.department}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <CalendarIcon className="h-4 w-4 mr-3 text-blue-500 shrink-0" />
                        <span className="font-semibold w-24">Date:</span>
                        <span className="text-slate-900 font-medium">
                          {formData.appointment_date}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-3 text-blue-500 shrink-0" />
                        <span className="font-semibold w-24">Time Slot:</span>
                        <span className="text-slate-900 font-medium">
                          {formData.time_slot}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 text-xs text-slate-500">
                        <span className="font-bold uppercase tracking-wider block mb-1">
                          Reason for consultation:
                        </span>
                        <p className="italic text-slate-700 text-sm bg-white p-2.5 rounded border border-slate-100">
                          "{formData.reason}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Controllers */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
                  >
                    Next Step <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="flex items-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md"
                  >
                    {isSubmitting ? "Logging Event..." : "Confirm & Book"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
