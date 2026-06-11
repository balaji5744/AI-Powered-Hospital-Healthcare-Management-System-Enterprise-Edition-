import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // 🛠️ FIXED: Added Link and useLocation
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Activity } from "lucide-react";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Catches data passed from the signup page

  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Checks if the user was redirected here after a successful registration
  const isSignupSuccess = location.state?.signupSuccess;

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    try {
      const cleanEmail = data.email.trim();
      await login(cleanEmail, data.password);
      navigate("/dashboard");
    } catch (err) {
      setApiError(
        "Invalid credentials. Please verify your email and password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            HospitalOS Portal
          </h2>
          <p className="text-sm text-slate-500 mt-2">Sign in to your account</p>
        </div>

        {/* 🌟 Registration Success Banner */}
        {isSignupSuccess && !apiError && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg text-center font-medium border border-emerald-100 animate-in slide-in-from-top-2">
            Account created successfully! Please sign in below.
          </div>
        )}

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-100 animate-in shake duration-300">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          autoComplete="off"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
              placeholder="admin@hospital.com"
              autoComplete="off"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 flex justify-center items-center shadow-sm text-sm"
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer Navigation Link */}
        <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
          New to our hospital?{" "}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
