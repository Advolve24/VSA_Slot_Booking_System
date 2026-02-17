import { CalendarCheck, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
     const navigate = useNavigate();
  return (
    <div className="w-full space-y-16">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full rounded-3xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/turf-VSA.jpg"
            alt="Vidyanchal Turf"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-green-900/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex justify-center px-4 py-16 sm:py-20">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full px-6 py-10 sm:px-10 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Book Your Slot at{" "}
              <span className="text-orange-500">
                Vidyanchal Sports Academy
              </span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-gray-600">
              Choose your preferred option and reserve your spot in just a few
              clicks
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-700 hover:bg-green-800 text-white px-8"
                onClick={() => navigate("/enroll")}
              >
                Enroll for Coaching
              </Button>

              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                onClick={() => navigate("/book-turf")}
              >
                Book Turf
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-800">
          How It Works
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Simple steps to get started with your booking
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-700">
              <Sparkles />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">
              Select Option
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Choose between Coaching Enrollment or Turf Booking based on your
              needs
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-700">
              <CalendarCheck />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">
              Choose Your Slot
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Pick a date and time that works best for your schedule
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">
              Confirm & Proceed
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Complete your booking and get instant confirmation
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
