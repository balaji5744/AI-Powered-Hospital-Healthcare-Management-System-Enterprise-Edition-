import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { usePatientProfile, useUpdatePatientProfile } from "../../api/hooks";
import {
  User,
  Phone,
  MapPin,
  ShieldAlert,
  Calendar,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Edit3,
  Save,
  X,
} from "lucide-react";

export default function PatientProfile() {
  const { data: profile, isLoading, isError } = usePatientProfile();
  const { mutateAsync: updateProfile } = useUpdatePatientProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

  // Seed form values when edit mode is triggered
  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name || "",
        date_of_birth: profile.date_of_birth
          ? profile.date_of_birth.split("T")[0]
          : "",
        gender: profile.gender || "",
        phone: profile.phone,
        emergency_contact: profile.emergency_contact,
        address: profile.address,
      });
    }
  }, [profile, isEditing, reset]);

  if (isLoading)
    return (
      <div className="text-slate-500 animate-pulse py-6 text-sm font-medium">
        Retrieving healthcare records...
      </div>
    );

  if (isError)
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 max-w-2xl">
        <p className="font-bold">Profile Unavailable</p>
        <p className="text-xs mt-1 font-medium">
          Please sign out and sign back in with a registered Patient Account.
        </p>
      </div>
    );

  const formatDate = (isoString) => {
    if (!isoString) return "Not Provided";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Pending Review";
    }
  };

  const onSaveSubmit = async (formData) => {
    setIsSaving(true);
    setApiError("");
    try {
      await updateProfile({
        ...profile,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: new Date(formData.date_of_birth).toISOString(),
        gender: formData.gender,
        phone: formData.phone.trim(),
        emergency_contact: formData.emergency_contact.trim(),
        address: formData.address.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      setApiError(
        err.response?.data?.detail || "Failed to sync profile changes.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSaveSubmit)}
      className="space-y-6 animate-in fade-in duration-300"
    >
      {/* ======================================================== */}
      {/* PROFILE HEADER CARD (EDIT BUTTON LIVES HERE) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="h-20 w-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg">
            {profile?.first_name ? profile.first_name.charAt(0) : "P"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {profile?.first_name} {profile?.last_name || ""}
            </h2>
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5" /> Electronic Health Record
              Secure
            </div>
          </div>
        </div>

        {/* 🛠️ HIGH-VISIBILITY BUTTON CONTAINER */}
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center bg-blue-600 text-white hover:bg-blue-700 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-md shadow-blue-200"
            >
              <Edit3 className="h-4 w-4 mr-2" /> Edit Profile Info
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setApiError("");
                }}
                className="flex items-center bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium px-4 py-2 rounded-xl transition-all text-sm"
              >
                <X className="h-4 w-4 mr-1.5" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-md shadow-emerald-200"
              >
                <Save className="h-4 w-4 mr-1.5" />{" "}
                {isSaving ? "Saving..." : "Save Edits"}
              </button>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center hidden sm:block">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
              Blood Type
            </span>
            <span className="text-xl font-black text-red-600 block">
              {profile?.blood_group || "O+"}
            </span>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100">
          {apiError}
        </div>
      )}

      {/* Main Form Fields Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Identity & Demographics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2">
              <User className="h-4 w-4" /> Demographics & Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  First Name
                </label>
                {!isEditing ? (
                  <span className="text-sm text-slate-800 font-semibold block py-2">
                    {profile?.first_name}
                  </span>
                ) : (
                  <input
                    {...register("first_name", { required: "Required" })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Last Name
                </label>
                {!isEditing ? (
                  <span className="text-sm text-slate-800 font-semibold block py-2">
                    {profile?.last_name || "—"}
                  </span>
                ) : (
                  <input
                    {...register("last_name")}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Date of Birth
                </label>
                {!isEditing ? (
                  <span className="text-sm text-slate-800 font-semibold block py-2 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />{" "}
                    {formatDate(profile?.date_of_birth)}
                  </span>
                ) : (
                  <input
                    type="date"
                    {...register("date_of_birth", { required: "Required" })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Gender
                </label>
                {!isEditing ? (
                  <span className="text-sm text-slate-800 font-semibold block py-2">
                    {profile?.gender}
                  </span>
                ) : (
                  <select
                    {...register("gender", { required: "Required" })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Clinical History Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 bg-slate-50/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Clinical Records (Managed by
              Hospital Admins)
            </h3>
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                Allergies
              </span>
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg font-medium">
                No known medical allergies logged.
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Contacts & Address */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" /> Channels & Location
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Phone Number
                </label>
                {!isEditing ? (
                  <span className="text-sm text-slate-800 font-semibold block py-1">
                    {profile?.phone}
                  </span>
                ) : (
                  <>
                    <input
                      {...register("phone", {
                        required: "Required",
                        pattern: {
                          value: indianPhoneRegex,
                          message: "Invalid India Format",
                        },
                      })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-[10px] mt-0.5">
                        {errors.phone.message}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Emergency Contact
                </label>
                {!isEditing ? (
                  <span className="text-sm text-red-600 font-bold flex items-center gap-1.5 py-1">
                    <ShieldAlert className="h-4 w-4 text-red-500" />{" "}
                    {profile?.emergency_contact}
                  </span>
                ) : (
                  <>
                    <input
                      {...register("emergency_contact", {
                        required: "Required",
                        pattern: {
                          value: indianPhoneRegex,
                          message: "Invalid India Format",
                        },
                      })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all"
                    />
                    {errors.emergency_contact && (
                      <p className="text-red-500 text-[10px] mt-0.5">
                        {errors.emergency_contact.message}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Address Registry
                </label>
                {!isEditing ? (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-medium italic">
                    {profile?.address}
                  </p>
                ) : (
                  <textarea
                    rows="3"
                    {...register("address", { required: "Required" })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-500 resize-none font-medium text-slate-700 bg-slate-50 focus:bg-white transition-all"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
