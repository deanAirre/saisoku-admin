import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImg from "../../assets/saisoku_wall_1.jpg";
import { Eye, EyeOff } from "lucide-react";
import { useAdmin } from "../../context/user-context";
import { loginAdmin } from "../../services/user/admin/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { refetchAdmin } = useAdmin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting admin login");
      await loginAdmin({ email, password });

      console.log("Admin login successful");
      console.log("Fetching admin profile");
      await refetchAdmin();
      console.log("Admin profile loaded, redirecting...");

      // Redirect to admin dashboard
      navigate("/admin", { replace: true });
    } catch (err: any) {
      console.error("Admin login error:", err);
      setError(
        err.message ||
          "Login failed. Please check your credentials or contact support.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Background Image */}
      <div
        className="w-full lg:w-1/2 h-64 sm:h-80 lg:min-h-screen relative"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center px-4">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Sa'isoku Official
            </h1>
            <p
              className="text-lg sm:text-xl opacity-90"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Admin Page
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <h1
            className="text-black text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-1 sm:mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Admin Login
          </h1>

          {/* Subtitle */}
          <p
            className="text-gray-600 text-sm sm:text-base text-center mb-6 sm:mb-8 lg:mb-12"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Enter your credentials to access the admin panel
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                className="block text-black font-medium mb-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 border-gray-200 rounded-full text-sm sm:text-base text-gray-700 border-2 focus:border-[#0ABAB5] focus:outline-none focus:ring-0"
                style={{ fontFamily: "Poppins, sans-serif" }}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                className="block text-black font-medium mb-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 border-gray-200 rounded-full text-sm sm:text-base text-gray-700 border-2 focus:border-[#0ABAB5] focus:outline-none focus:ring-0"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0ABAB5] text-white font-bold text-lg py-3 rounded-full hover:bg-[#2E8B57] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p
              className="text-gray-600 text-xs text-center"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              This is a secure admin area. All login attempts are monitored and
              logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
