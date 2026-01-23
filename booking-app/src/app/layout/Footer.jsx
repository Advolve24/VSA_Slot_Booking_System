// src/app/layout/Footer.jsx
import { ShieldCheck, BadgeCheck, Trophy } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600 space-y-3">

        <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-700">
          <span className="flex items-center gap-1">
            <BadgeCheck className="w-4 h-4 text-green-700" />
            Certified Coaching Staff
          </span>

          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            Secure Payments via Razorpay
          </span>

          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-green-700" />
            Vidyanchal Sports Academy
          </span>
        </div>

        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Vidyanchal Sports Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
