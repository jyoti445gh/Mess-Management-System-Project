import { ArrowRight, Utensils, CalendarCheck, BarChart3, Bell } from "lucide-react";
import React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: CalendarCheck, label: "Meal Opt-in/Out", desc: "Plan your meals in advance" },
  { icon: BarChart3, label: "Usage Analytics", desc: "Track your meal history" },
  { icon: Bell, label: "Smart Reminders", desc: "Never miss a meal deadline" },
];

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!user) return navigate("/login");
    if (user.role === "admin") navigate("/admin");
    else if (user.role === "mess_manager") navigate("/manager");
    else navigate("/student");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">

      {/* Hero section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">

          {user && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-medium px-4 py-1.5 rounded-full">
              👋 Welcome back, {user.name}
            </div>
          )}

          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 px-3 py-1">
            <Utensils className="w-3 h-3 mr-1.5" />
            Smart Mess Management System
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Manage Your Meals{" "}
            <span className="text-green-600">Smartly</span>
            <br />& Effortlessly
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed">
            Opt in or out of meals, track your usage, view the daily menu, and manage
            mess operations — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 px-8"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/menu")}
              className="px-8"
            >
              View Menu
            </Button>
          </div>

          <p className="text-xs text-gray-400 pt-1">
            Easy • Fast • Automated Meal Tracking
          </p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-4xl mx-auto w-full px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-green-600" />
              </div>
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Hero;
