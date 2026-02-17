import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { CheckCircle2, Tag, X } from "lucide-react";

import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { sendOtp } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";
import { Label } from "@/components/ui/label";

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
  const [discountLoading, setDiscountLoading] = useState(false);

  const totalDiscount = discountData?.totalDiscountAmount || 0;
  const finalAmount = discountData?.finalAmount || baseAmount;

  const coverImage = sportImage
    ? `${ASSETS_BASE}${sportImage}`
    : "/placeholder-sport.jpg";

  /* ================= APPLY DISCOUNT ================= */

  const applyDiscountCode = async () => {
    if (!discountCode) return;

    try {
      setDiscountLoading(true);

      const res = await api.post("/discounts/preview", {
        type: "turf",
        amount: baseAmount,
        discountCodes: [discountCode],
      });

      setDiscountData(res.data);
      toast({ title: "Discount applied 🎉" });
    } catch (err) {
      toast({
        variant: "destructive",
        title:
          err?.response?.data?.message || "Invalid discount code",
      });
      setDiscountData(null);
    } finally {
      setDiscountLoading(false);
    }
  };

  const removeDiscount = () => {
    setDiscountCode("");
    setDiscountData(null);
  };

  /* ================= FORM ================= */

  const [form, setForm] = useState({
    userName: "",
    email: "",
    mobile: "",
    notes: "",
  });

  const [isExistingUser, setIsExistingUser] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

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
    setIsExistingUser(true);
  }, [user]);

  /* ================= OTP ================= */

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

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

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast({ variant: "destructive", title: "Invalid mobile number" });
      return;
    }

    try {
      const result = await sendOtp(`+91${form.mobile}`);
      setConfirmResult(result);
      setOtpSent(true);
      startTimer();
      toast({ title: "OTP sent" });
    } catch {
      toast({ variant: "destructive", title: "OTP failed" });
    }
  };

  useEffect(() => {
    if (otp.length === 6 && confirmResult && !phoneVerified) {
      verifyOtp();
    }
  }, [otp]);

  const verifyOtp = async () => {
    try {
      await confirmResult.confirm(otp);
      setPhoneVerified(true);
      setOtpSent(false);
      toast({ title: "Mobile verified ✅" });
    } catch {
      toast({ variant: "destructive", title: "Invalid OTP" });
      setOtp("");
    }
  };

  /* ================= RAZORPAY ================= */

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
      toast({ variant: "destructive", title: "Verify mobile first" });
      return;
    }

    try {
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
        paymentMode: "razorpay",
        discountCodes: discountCode ? [discountCode] : [],
      });

      const rental = rentalRes.data;

      await loadRazorpay();

      const orderRes = await api.post("/payments/create-order", {
        purpose: "turf",
        turfRentalId: rental._id,
      });

      const { orderId, amount, key, paymentId } = orderRes.data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        order_id: orderId,
        name: "Turf Booking",
        description: `${facilityName} – ${sportName}`,
        handler: async (response) => {
          await api.post("/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId,
          });

          toast({ title: "Booking confirmed 🎉" });
          navigate("/", { replace: true });
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast({
        variant: "destructive",
        title:
          err?.response?.data?.message || "Payment failed",
      });
    }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">

        {/* SUMMARY CARD */}
        <div>
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <img
              src={coverImage}
              alt={sportName}
              className="h-48 w-full object-cover"
            />
            <div className="p-4 space-y-4">

              <h2 className="text-lg font-semibold">
                {facilityName}
              </h2>

              <div className="text-sm text-gray-600 space-y-1">
                <div>Sport: <b>{sportName}</b></div>
                <div>Date: <b>{format(new Date(date), "dd MMM yyyy")}</b></div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  Booked Slots
                </p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <span
                      key={slot.time}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                    >
                      {slot.label}
                    </span>
                  ))}
                </div>
              </div>

              <hr />

              <div className="flex justify-between">
                <span>Base Amount</span>
                <span>₹{baseAmount}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span>- ₹{totalDiscount}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-green-700 text-lg">
                <span>Payable</span>
                <span>₹{finalAmount}</span>
              </div>

            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow space-y-4">

          <h2 className="text-lg font-semibold">
            Player Details
          </h2>

          {/* MOBILE */}
          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <div className="flex gap-3 items-center">
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
              {!phoneVerified && !otpSent && (
                <Button onClick={handleSendOtp}>
                  Verify
                </Button>
              )}
              {!phoneVerified && otpSent && (
                <Input
                  placeholder="OTP"
                  className="w-28"
                  value={otp}
                  maxLength={6}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                />
              )}
            </div>
          </div>

          {/* NAME + EMAIL */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={form.userName}
                onChange={(e) =>
                  setForm({ ...form, userName: e.target.value })
                }
                disabled={!phoneVerified}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                disabled={!phoneVerified}
              />
            </div>
          </div>

          {/* NOTES */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />
          </div>

          {/* DISCOUNT FIELD */}
          <div className="space-y-2">
            <Label>Apply Discount Code</Label>
            <div className="flex gap-3">
              <Input
                placeholder="Enter coupon code"
                value={discountCode}
                onChange={(e) =>
                  setDiscountCode(
                    e.target.value.toUpperCase()
                  )
                }
              />
              <Button
                variant="outline"
                onClick={applyDiscountCode}
                disabled={discountLoading}
              >
                <Tag className="w-4 h-4 mr-1" />
                Apply
              </Button>
              {discountData && (
                <Button
                  variant="ghost"
                  onClick={removeDiscount}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* SUBMIT */}
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 mt-4"
            onClick={handleSubmit}
            disabled={!phoneVerified}
          >
            Confirm Booking – ₹{finalAmount}
          </Button>

        </div>
      </div>
    </div>
  );
}
