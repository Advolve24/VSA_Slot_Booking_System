import { useNavigate } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Calendar,
  Users,
  User,
  ArrowLeft,
} from "lucide-react";

export default function EnrollCoaching() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [sports, setSports] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    playerName: "",
    age: "",
    mobile: "",
    email: "",
    notes: "",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      const sportsRes = await api.get("/sports");
      const batchesRes = await api.get("/batches");

      const sortedSports = [...sportsRes.data].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setSports(sortedSports);
      setBatches(batchesRes.data);

      if (sortedSports.length) {
        setSelectedSport(sortedSports[0]);
      }
    };

    fetchData();
  }, []);

  /* ================= FILTER ================= */
  const filteredBatches = useMemo(() => {
    if (!selectedSport) return [];
    return batches.filter(
      (b) =>
        b.sportName === selectedSport.name &&
        b.status === "active"
    );
  }, [selectedSport, batches]);

  /* ================= PAYMENT ================= */
  const monthlyFee = selectedBatch?.monthlyFee || 0;
  const total = monthlyFee; // taxes = 0

  /* ================= RESET ================= */
  const resetToHome = () => {
    setSelectedBatch(null);
    setForm({
      playerName: "",
      age: "",
      mobile: "",
      email: "",
      notes: "",
    });
  };

  /* ================= SUBMIT ================= */
  const submitEnrollment = async () => {
    if (submitting) return;

    /* ================= NAME VALIDATION ================= */
    if (!form.playerName || form.playerName.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Please enter child's full name (min 3 characters)",
      });
      return;
    }

    /* ================= AGE VALIDATION ================= */
    if (!form.age) {
      toast({
        variant: "destructive",
        title: "Age required",
        description: "Please enter child's age",
      });
      return;
    }

    const ageNum = Number(form.age);
    if (isNaN(ageNum) || ageNum < 4 || ageNum > 16) {
      toast({
        variant: "destructive",
        title: "Invalid Age",
        description: "Age must be between 4 and 16 years",
      });
      return;
    }

    /* ================= MOBILE VALIDATION ================= */
    if (!form.mobile) {
      toast({
        variant: "destructive",
        title: "Mobile number required",
        description: "Please enter mobile number",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast({
        variant: "destructive",
        title: "Invalid Mobile Number",
        description: "Enter a valid 10-digit Indian mobile number",
      });
      return;
    }

    /* ================= EMAIL VALIDATION (REQUIRED) ================= */
    if (!form.email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    /* ================= BATCH CHECK ================= */
    if (!selectedBatch) {
      toast({
        variant: "destructive",
        title: "Batch not selected",
        description: "Please select a coaching batch",
      });
      return;
    }

    /* ================= SUBMIT ================= */
    setSubmitting(true);

    try {
      await api.post("/enrollments/website", {
        source: "website",
        playerName: form.playerName.trim(),
        age: ageNum,
        mobile: form.mobile,
        email: form.email.toLowerCase(),
        batchName: selectedBatch.name,
        startDate: new Date().toISOString().slice(0, 10),
        planType: "monthly",
        paymentMode: "razorpay",
      });

      toast({
        title: "Enrollment Successful 🎉",
        description: "You have been enrolled successfully",
        duration: 3000,
      });

      // return to home after toast
      setTimeout(() => {
        resetToHome();
      }, 1200);

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const goHome = () => {
    // reset state so it actually returns to sport selection view
    setSelectedBatch(null);
    setForm({
      playerName: "",
      age: "",
      mobile: "",
      email: "",
      notes: "",
    });

    // route back to home
    navigate("/", { replace: true });
  };


  return (
    <div className="space-y-10">
      {/* ================= TITLE ================= */}
      <div>
        <h1 className="text-2xl font-bold text-green-800">
          Enroll for Coaching
        </h1>
        <p className="text-sm text-gray-600">
          Choose the sport and batch that best fits your child's training goals.
        </p>
      </div>

      {/* ================= SPORT + BATCH SELECTION ================= */}
      {!selectedBatch && (
        <>
          <h2 className="font-semibold text-green-700">Select a Sport</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {sports.map((s) => (
              <button
                key={s._id}
                onClick={() => setSelectedSport(s)}
                className={`relative h-36 rounded-xl overflow-hidden border transition
                ${selectedSport?._id === s._id
                    ? "ring-4 ring-green-800"
                    : "hover:ring-4 hover:ring-green-500"
                  }`}
              >
                <img
                  src={`http://localhost:5000${s.iconUrl}`}
                  alt={s.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-0 w-full bg-black/60 text-white text-sm font-semibold py-2 text-center">
                  {s.name}
                </div>
              </button>
            ))}
          </div>

          {selectedSport && (
            <>
              <h2 className="font-semibold text-green-700 mt-8">
                Available Coaching Batches
              </h2>

              <div className="space-y-4">
                {filteredBatches.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white rounded-2xl px-6 py-5 border shadow-sm
                    flex flex-col lg:flex-row lg:justify-between gap-6"
                  >
                    <div className="min-w-[240px]">
                      <h3 className="text-lg font-semibold">{b.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                        <Clock className="w-4 h-4 text-green-700" />
                        {b.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 text-green-700" />
                        {b.schedule}
                      </div>
                    </div>

                    <div className="min-w-[180px] space-y-2 flex flex-col justify-end">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-green-700" />
                        6–10 Years
                      </div>
                      <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                        <Users className="w-4 h-4" />
                        {b.enrolledCount}/{b.capacity} seats
                      </div>
                    </div>

                    <div className="min-w-[180px] flex items-center mt-1">
                      <User className="w-4 h-4 text-green-700 mr-2" />
                      {b.coachName}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="text-green-800 text-xl font-bold">
                        ₹ {b.monthlyFee}
                        <span className="text-sm font-normal text-gray-500">
                          /month
                        </span>
                      </div>

                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-full"
                        onClick={() => setSelectedBatch(b)}
                      >
                        Enroll
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ================= ENROLLMENT FORM ================= */}
      {selectedBatch && (
        <>
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => setSelectedBatch(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sports
          </Button>

          <div className="bg-white border rounded-xl p-6 space-y-6">
            <h2 className="font-semibold text-green-700">
              Enrollment Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Child Name */}
              <Input
                placeholder="Child's Full Name"
                value={form.playerName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    playerName: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                  })
                }
                maxLength={50}
                required
              />

              {/* Age */}
              <Input
                type="number"
                placeholder="Age (4 - 16)"
                value={form.age}
                min={4}
                max={16}
                onChange={(e) =>
                  setForm({ ...form, age: e.target.value })
                }
                required
              />

              {/* Mobile */}
              <Input
                placeholder="10-digit Mobile Number"
                value={form.mobile}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, mobile: val });
                }}
                required
              />

              {/* Email */}
              <Input
                type="email"
                placeholder="Email "
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value.trim() })
                }
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                title="Please enter a valid email address"
                maxLength={100}
              />

            </div>


            <div className="bg-white border rounded-xl p-6 space-y-3">
              <h2 className="font-semibold text-green-700">
                Payment Summary
              </h2>
              <div className="flex justify-between text-sm">
                <span>Monthly Coaching Fee</span>
                <span>₹ {monthlyFee}</span>
              </div>
              <div className="flex justify-between font-semibold text-green-800 pt-3 border-t">
                <span>Total Payable</span>
                <span>₹ {total}</span>
              </div>
            </div>

            {/* ================= PAYMENT ACTIONS ================= */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Cancel Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-1/2 py-6 text-base"
                onClick={goHome}
              >
                Cancel
              </Button>

              {/* Proceed Button */}
              <Button
                type="button"
                disabled={submitting}
                className="w-full sm:w-1/2 bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
                onClick={submitEnrollment}
              >
                {submitting ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
