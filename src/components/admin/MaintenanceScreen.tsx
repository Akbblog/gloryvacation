"use client";

import { useState, useEffect } from "react";
import { Wrench, Clock, LogIn, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface MaintenanceScreenProps {
  onExit?: () => void;
}

export default function MaintenanceScreen({ onExit }: MaintenanceScreenProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Optional: Add a countdown or something
    const timer = setInterval(() => {
      setTimeLeft(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-8 h-8 text-teal-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Under Maintenance
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          We're currently performing scheduled maintenance to improve your experience.
          The site will be back online shortly.
        </p>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            Maintenance in progress
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>

        {/* Expected Time */}
        <div className="text-sm text-gray-500 mb-8">
          Expected completion: Soon
        </div>

        {/* Admin Login Button */}
        <Link
          href={`/auth/signin?callbackUrl=/admin`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <LogIn className="w-4 h-4" />
          Admin Login
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}