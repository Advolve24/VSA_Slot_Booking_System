import { useState } from "react";
import api from "../../lib/axios";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const logo = "/VSA-Logo-1.png";
const bgImage = "/sportground.webp";

export default function AdminLogin() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/admin-login", {
        email,
        password,
      });

      setAuth(res.data.token, res.data.user);
      navigate("/admin");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ================= LEFT IMAGE SIDE ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative">

        <img
          src={bgImage}
          alt="VSA Stadium"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 to-black/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white space-y-4">

          <img src={logo} alt="VSA Logo" className="w-14 mb-4" />

          <h1 className="text-4xl font-bold">
            VSA Slot Booking System
          </h1>

          <p className="text-gray-200 max-w-md">
            Manage sports facility bookings, schedules and availability —
            all from one powerful admin dashboard.
          </p>

        </div>
      </div>

      {/* ================= RIGHT FORM SIDE ================= */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-12">

        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border">

          {/* Logo (Mobile Only) */}
          <div className="flex justify-center mb-6 lg:hidden">
            <img src={logo} alt="VSA Logo" className="w-16" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">
            Admin Login
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your credentials to continue
          </p>

          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                  placeholder="admin@vsa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative mt-2">
                <Lock
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-green-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 VSA Slot Booking System. All rights reserved.
          </p>

        </div>
      </div>
    </div>
  );
}