import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { CheckCircle2, Check } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendOtp } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";


const ASSETS_BASE =
  import.meta.env.VITE_ASSETS_BASE_URL || "http://localhost:5000";

export default function TurfConfirm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const setAuth = useUserStore((s) => s.setAuth);
  const user = useUserStore((s) => s.user);

  if (!state) {
    navigate("/book-turf");
    return null;
  }

  const {
    sportId,
    sportName,
    sportImage,
    facilityId,
    facilityName,
    date,
    slots = [],
    hourlyRate,
  } = state;

  /* ================= AMOUNT ================= */
  const baseAmount = slots.length * hourlyRate;
  const [discountCode, setDiscountCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  const finalAmount = discountData?.finalAmount || baseAmount;
  const [processingPayment, setProcessingPayment] = useState(false);

  const coverImage = sportImage
    ? `${ASSETS_BASE}${sportImage}`
    : "/placeholder-sport.jpg";

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    userName: "",
    email: "",
    mobile: "",
    notes: "",
  });

  /* ================= OTP ================= */
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (!user) return;

    setForm({
      userName: user.fullName || "",
      email: user.email || "",
      mobile: user.mobile || "",
      notes: "",
    });

    setPhoneVerified(true);
  }, [user]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timer === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [timer]);

  const startTimer = () => {
    setTimer(60);
    timerRef.current = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
  };

  /* ================= SEND OTP ================= */
  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast({
        variant: "destructive",
        title: "Invalid Mobile Number",
      });
      return;
    }

    const result = await sendOtp(`+91${form.mobile}`);
    setConfirmResult(result);
    setOtpSent(true);
    startTimer();
    toast({ title: "OTP Sent" });
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    try {
      await confirmResult.confirm(otp);

      setPhoneVerified(true);
      setOtpSent(false);

      const res = await api.get(
        `/users/check-mobile/${form.mobile}`
      );

      if (res.data.exists) {
        const loginRes = await api.post(
          "/auth/player-login",
          { mobile: form.mobile }
        );

        const { token, user } = loginRes.data;
        setAuth({ token, user });

        setForm((prev) => ({
          ...prev,
          userName: user.fullName || "",
          email: user.email || "",
        }));

        toast({ title: "Welcome Back 👋" });
      } else {
        toast({ title: "Mobile verified ✅" });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
      });
    }
  };

  /* ================= DISCOUNT ================= */
  const applyDiscountCode = async () => {
    if (!discountCode) return;

    try {
      const res = await api.post("/discounts/preview", {
        type: "turf",
        amount: baseAmount,
        discountCodes: [discountCode],
      });

      setDiscountData(res.data);
      toast({ title: "Discount Applied 🎉" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Invalid Coupon",
      });
    }
  };

  /* ================= PAYMENT ================= */
  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });

  const handleSubmit = async () => {
    if (!phoneVerified) {
      toast({
        variant: "destructive",
        title: "Verify mobile first",
      });
      return;
    }

    try {
      setProcessingPayment(true); // 🔥 disable UI immediately

      /* ================= CREATE RENTAL ================= */
      const rentalRes = await api.post("/turf-rentals", {
        source: "website",
        userName: form.userName,
        phone: form.mobile,
        email: form.email,
        notes: form.notes,
        facilityId,
        sportId,
        rentalDate: date,
        slots: slots.map((s) => s.time),
        discountCodes: discountCode ? [discountCode] : [],
        paymentMode: "razorpay",
      });

      const rental = rentalRes.data;

      /* ================= LOAD RAZORPAY ================= */
      await loadRazorpay();

      /* ================= CREATE ORDER ================= */
      const orderRes = await api.post("/payments/create-order", {
        purpose: "turf",
        turfRentalId: rental._id,
      });

      const { orderId, amount, key, paymentId } = orderRes.data;

      const razor = new window.Razorpay({
        key,
        amount: amount * 100,
        currency: "INR",
        order_id: orderId,
        name: "Turf Booking",
        description: `${facilityName} – ${sportName}`,

        handler: async (response) => {
          try {
            if (!response?.razorpay_payment_id) return;

            /* ================= VERIFY PAYMENT ================= */
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            });

            /* ================= REDIRECT ================= */
            navigate("/turf-success", {
              state: {
                userName: form.userName,
                email: form.email,
              },
              replace: true,
            });

          } catch (err) {
            console.error("Verify error:", err);

            toast({
              variant: "destructive",
              title: "Payment verification failed",
            });

            setProcessingPayment(false);
          }
        },

        modal: {
          ondismiss: function () {
            setProcessingPayment(false);

            toast({
              variant: "destructive",
              title: "Payment cancelled",
            });
          },
        },

        theme: {
          color: "#15803d",
        },
      });

      razor.open();

    } catch (err) {
      console.error(err);
      setProcessingPayment(false);

      toast({
        variant: "destructive",
        title: "Something went wrong",
      });
    }
  };
  const activeStep = 4;
  const handleBack = () => {
    navigate("/book-turf", {
      state: {
        sportId,
        facilityId,
        date,
        slots,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">

      {/* ================= HEADER WITH BACK + STEPS ================= */}
      <div className="w-full mb-6">

        {/* ================= STEPPER ================= */}
        <div className="rounded-xl py-3 px-2 md:px-4 mb-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-between w-full max-w-3xl">

              {["Sport", "Facility", "Time Slot", "Review"].map(
                (step, index) => {
                  const stepNumber = index + 1;
                  const isCompleted = activeStep > stepNumber;
                  const isActive = activeStep === stepNumber;
                  const isLast = stepNumber === 4;

                  return (
                    <div key={index} className="flex items-center flex-1">

                      {/* STEP */}
                      <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3">

                        <div
                          className={`
                      w-8 h-8 rounded-full
                      flex items-center justify-center
                      text-white text-sm font-semibold
                      transition-all duration-300
                      ${isCompleted
                              ? "bg-green-700"
                              : isActive
                                ? "bg-green-600"
                                : "bg-gray-300 text-gray-500"
                            }
                    `}
                        >
                          {isCompleted ? (
                            <Check size={16} />
                          ) : (
                            stepNumber
                          )}
                        </div>

                        <span
                          className={`
                      text-[11px] sm:text-sm whitespace-nowrap
                      ${isCompleted || isActive
                              ? "text-green-700"
                              : "text-gray-400"
                            }
                    `}
                        >
                          {step}
                        </span>
                      </div>

                      {/* CONNECTOR */}
                      {!isLast && (
                        <div
                          className={`
                      flex-1 h-[2px] mx-2 sm:mx-4 transition-all duration-300
                      ${activeStep > stepNumber
                              ? "bg-green-700"
                              : "bg-gray-300"
                            }
                    `}
                        />
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* ================= BACK BUTTON ================= */}
        <div className="flex items-center justify-between">
          {activeStep > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-green-700 font-medium text-sm hover:opacity-80 transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
      {/* ================= MAIN GRID ================= */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* ================= LEFT CARD ================= */}
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <img
            src={coverImage}
            className="h-44 sm:h-74 w-full object-cover"
            alt={sportName}
          />

          <div className="p-4 sm:p-6 space-y-4">

            <h2 className="text-xl font-semibold">
              {facilityName}
            </h2>

            <div className="text-gray-600 text-sm space-y-1">
              <p>Sport: <b>{sportName}</b></p>
              <p>Date: <b>{format(new Date(date), "dd MMM yyyy")}</b></p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">
                Booked Slots
              </p>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot, i) => (
                  <span
                    key={i}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {slot.label || slot.time}
                  </span>
                ))}
              </div>
            </div>

            <hr />

            <div className="flex justify-between text-gray-700">
              <span>Base Amount</span>
              <span>₹{baseAmount}</span>
            </div>

            <div className="flex justify-between text-green-700 text-lg font-semibold">
              <span>Payable</span>
              <span>₹{finalAmount}</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT FORM ================= */}
        <div className="bg-white rounded-2xl shadow border p-4 sm:p-8 space-y-6">

          <h2 className="text-xl font-semibold">
            Player Details
          </h2>

          {/* MOBILE */}
          <div className="space-y-2">
            <Label>Mobile Number</Label>

            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Input
                  disabled={phoneVerified}
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                />
                {phoneVerified && (
                  <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-600" />
                )}
              </div>

              {!phoneVerified && !otpSent && (
                <Button onClick={handleSendOtp}>
                  Verify
                </Button>
              )}

              {otpSent && !phoneVerified && (
                <>
                  <Input
                    className="w-24"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ""))
                    }
                  />
                  <Button onClick={verifyOtp}>
                    Verify OTP
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* NAME + EMAIL */}
          <div className={`grid grid-cols-2 gap-4 ${!phoneVerified ? "opacity-50 pointer-events-none" : ""}`}>
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.userName}
                onChange={(e) =>
                  setForm({ ...form, userName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />
          </div>

          {/* COUPON */}
          <div>
            <Label>Apply Discount Code</Label>
            <div className="flex gap-3 mt-2">
              <Input
                placeholder="Enter coupon code"
                value={discountCode}
                onChange={(e) =>
                  setDiscountCode(e.target.value.toUpperCase())
                }
              />
              <Button variant="outline" onClick={applyDiscountCode}>
                Apply
              </Button>
            </div>
          </div>

          {/* CONFIRM BUTTON */}
          <Button
            className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-lg font-semibold"
            disabled={!phoneVerified}
            onClick={handleSubmit}
          >
            Confirm Booking – ₹{finalAmount}
          </Button>

        </div>
      </div>
    </div>
  );
}