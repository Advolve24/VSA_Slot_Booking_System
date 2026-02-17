import { useState, useRef, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import { sendOtp } from "@/lib/firebase";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/userStore";

export default function SignInModal({ open, onClose }) {
  const { toast } = useToast();
  const setAuth = useUserStore((s) => s.setAuth);

  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmResult, setConfirmResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const inputsRef = useRef([]);

  const LOGO_URL = "/VSA-Logo-1.png";

  /* ================= RESET ================= */
  useEffect(() => {
    if (!open) {
      setStep("mobile");
      setMobile("");
      setOtp(["", "", "", "", "", ""]);
      setConfirmResult(null);
      setTimer(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [open]);

  /* ================= TIMER CLEANUP ================= */
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
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast({
        variant: "destructive",
        title: "Invalid mobile number",
      });
      return;
    }

    try {
      const result = await sendOtp(`+91${mobile}`);
      setConfirmResult(result);
      setStep("otp");
      startTimer();
      toast({ title: "OTP sent successfully" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
      });
    }
  };

  /* ================= OTP INPUT ================= */
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* ================= AUTO VERIFY ================= */
  useEffect(() => {
    if (otp.join("").length === 6) {
      verifyOtp();
    }
  }, [otp]);

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
  if (!confirmResult) return;

  try {
    setVerifying(true);

    // 1️⃣ Verify OTP via Firebase
    await confirmResult.confirm(otp.join(""));

    // 2️⃣ Check if user exists
    const res = await api.get(`/users/check-mobile/${mobile}`);

    if (res.data.exists) {
      // Existing user → login
      const loginRes = await api.post("/auth/player-login", {
        mobile,
      });

      const { token, user } = loginRes.data;

      setAuth({ token, user });

      localStorage.setItem("verifiedMobile", mobile);

      toast({ title: "Login successful ✅" });

    } else {
      // 🔥 NEW USER FLOW (NO AUTH SET HERE)
      localStorage.setItem("verifiedMobile", mobile);

      toast({
        title: "Mobile verified ✅",
        description: "Please complete your profile.",
      });
    }

    onClose();

  } catch (err) {
    toast({
      variant: "destructive",
      title: "Invalid OTP",
    });

    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  } finally {
    setVerifying(false);
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
        >
          <X size={22} />
        </button>

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img
            src={LOGO_URL}
            alt="Academy Logo"
            className="h-16 object-contain"
          />
        </div>

        {/* ================= MOBILE STEP ================= */}
        {step === "mobile" && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                Login
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your mobile number to continue
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium">
                  Mobile Number
                </label>
                <Input
                  placeholder="Enter 10-digit mobile number"
                  className="h-12 mt-2 rounded-xl"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                />
              </div>

              <Button
                className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl text-base font-semibold"
                onClick={handleSendOtp}
              >
                Send OTP
              </Button>
            </div>
          </>
        )}

        {/* ================= OTP STEP ================= */}
        {step === "otp" && (
          <>
            <div className="flex items-center mb-6">
              <button
                onClick={() => setStep("mobile")}
                className="text-green-600 flex items-center text-sm"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back
              </button>
            </div>

            <h2 className="text-xl font-bold mb-2">
              Verify OTP
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              Enter OTP sent to +91 {mobile}
            </p>

            <div className="flex justify-between gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(e.target.value, index)
                  }
                  maxLength={1}
                  className="w-12 h-14 text-center text-lg border rounded-xl"
                />
              ))}
            </div>

            <div className="text-center text-sm text-gray-500 mb-6">
              {timer > 0 ? (
                <>Resend OTP in <b>{timer}s</b></>
              ) : (
                <button
                  onClick={handleSendOtp}
                  className="text-green-600 font-medium"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <Button
              className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl text-base font-semibold"
              disabled={verifying}
              onClick={verifyOtp}
            >
              {verifying ? "Verifying..." : "Verify & Login"}
            </Button>
          </>
        )}

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
