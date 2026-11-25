
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "./api/axios";

import {
  User,
  Mail,
  Shield,
  CalendarDays,
  Clock,
  Fingerprint,
  LogOut,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();

  // Fetch authenticated user profile
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get<UserProfile>("/profile");

        setUser(response.data);
      } catch (err: unknown) {
        if (
          axios.isAxiosError(err) &&
          err.response?.status === 401
        ) {
          navigate("/login", { replace: true });
        } else {
          setError("Unable to fetch your profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  // Logout
  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");

    try {
      await api.post("/logout");

      setUser(null);

      navigate("/login", { replace: true });
    } catch {
      setError("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  // Format timestamps
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <LoaderCircle className="h-10 w-10 animate-spin text-indigo-400" />

        <p className="text-sm text-slate-300">
          Loading your profile...
        </p>
      </div>
    );
  }

  // Error screen
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <p className="text-red-400">
          {error || "Profile unavailable"}
        </p>

        <button
          onClick={() => navigate("/login")}
          className="rounded-xl bg-indigo-500 px-6 py-3 font-medium text-white hover:bg-indigo-400"
        >
          Back to Login
        </button>
      </div>
    );
  }

  const profileDetails = [
    {
      icon: Fingerprint,
      label: "User ID",
      value: user.id,
    },
    {
      icon: User,
      label: "Username",
      value: user.username,
    },
    {
      icon: Mail,
      label: "Email Address",
      value: user.email,
    },
    {
      icon: Shield,
      label: "Account Role",
      value: user.role,
    },
    {
      icon: CalendarDays,
      label: "Member Since",
      value: formatDate(user.created_at),
    },
    {
      icon: Clock,
      label: "Last Updated",
      value: formatDate(user.updated_at),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">

      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" />

      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <h1 className="text-xl font-bold tracking-tight text-white">
            Auth<span className="text-indigo-400">Flow</span>
          </h1>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            <LogOut size={16} />

            {loggingOut ? "Logging out..." : "Logout"}
          </button>

        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex justify-center px-4 py-12">

        {/* Profile Card */}
        <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10">

          {/* Profile Header */}
          <div className="mb-8 flex flex-col items-center text-center">

            {/* Avatar */}
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-bold text-white shadow-lg shadow-indigo-500/30">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white">
              {user.username}
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              Manage your personal information
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300">
              <ShieldCheck size={15} />
              Authenticated User
            </div>

          </div>

          <div className="mb-6 border-t border-white/10" />

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {/* Personal Information */}
          <h3 className="mb-5 text-lg font-semibold text-white">
            Personal Information
          </h3>

          <div className="space-y-3">

            {profileDetails.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >

                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <item.icon size={20} />
                </div>

                {/* User Information */}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    {item.label}
                  </p>

                  <p className="mt-1 break-all text-sm font-medium capitalize text-white">
                    {item.value}
                  </p>
                </div>

              </div>
            ))}

          </div>

          {/* Security Information */}
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">

            <ShieldCheck
              size={26}
              className="shrink-0 text-green-400"
            />

            <div>
              <p className="text-sm font-semibold text-green-400">
                Your session is secure
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Authenticated using an HTTP-only cookie.
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default Profile;
