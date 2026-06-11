import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSignupPatient } from "../api/hooks";
import { UserPlus, ShieldAlert } from "lucide-react";

export default function Signup() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const { mutateAsync: signupPatient } = useSignupPatient();
  const navigate = useNavigate();

  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordValue = watch("password");

  // Indian Phone Number Regex: Accepts 10 digits starting with 6-9 (optional +91 or 0 prefix)
  const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    try {
      await signupPatient({
        email: data.email.trim(),
        password: data.password,
        first_name: data.first_name.trim(),
        last_name: data.last_name ? data.last_name.trim() : "", // Optional field safe-check
        phone: data.phone.trim(),
        gender: data.gender,
        date_of_birth: new Date(data.date_of_birth).toISOString(),
        address: data.address.trim(),
        emergency_contact: data.emergency_contact.trim(),
      });

      navigate("/login", { state: { signupSuccess: true } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setApiError(
        Array.isArray(detail)
          ? `Validation Error on: ${detail[0].loc[detail[0].loc.length - 1]}`
          : detail || "Registration failed. Please check your inputs.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 animate-in fade-in duration-300">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {/* Header Block */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Patient Registration
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Create your comprehensive HospitalOS profile
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-100 flex items-center justify-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            {apiError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          autoComplete="off"
        >
          {/* Section 1: Account Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
              1. Account Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="name@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password", {
                    required: "Required",
                    minLength: { value: 6, message: "Min 6 chars" },
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Required",
                    validate: (value) => value === passwordValue || "Mismatch",
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
              2. Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  First Name
                </label>
                <input
                  {...register("first_name", {
                    required: "First name is required",
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Aarav"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Last Name{" "}
                  <span className="text-slate-400 font-normal text-[11px]">
                    (Optional)
                  </span>
                </label>
                <input
                  {...register("last_name")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50/30"
                  placeholder="Sharma"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...register("date_of_birth", {
                    required: "DOB is required",
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                {errors.date_of_birth && (
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Gender
                </label>
                <select
                  {...register("gender", { required: "Gender is required" })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                >
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: India-Style Contact & Address */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
              3. Contact & Location (India Standard)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: indianPhoneRegex,
                      message: "Enter valid 10-digit Indian number",
                    },
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="e.g., 9876543210 or +919876543210"
                />
                {errors.phone && (
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Emergency Contact Number
                </label>
                <input
                  type="tel"
                  {...register("emergency_contact", {
                    required: "Emergency contact is required",
                    pattern: {
                      value: indianPhoneRegex,
                      message: "Enter valid 10-digit Indian number",
                    },
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="e.g., 9123456789"
                />
                {errors.emergency_contact && (
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {errors.emergency_contact.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Residential Address
                </label>
                <input
                  {...register("address", { required: "Address is required" })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Flat No, Street Name, City, State, Pincode"
                />
                {errors.address && (
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 flex justify-center items-center shadow-md text-sm"
            >
              {isLoading ? "Processing Registration..." : "Register Profile"}
            </button>
          </div>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-bold underline transition-colors"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
