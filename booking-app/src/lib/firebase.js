import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let recaptchaVerifier;

export const sendOtp = async (phone) => {
  try {
    // 🔥 Clear old verifier
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
    }

    // ✅ Correct constructor order for v9
    recaptchaVerifier = new RecaptchaVerifier(
      auth,                       // FIRST param
      "recaptcha-container",      // SECOND param
      {
        size: "invisible",
      }
    );

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      recaptchaVerifier
    );

    return confirmationResult;
  } catch (error) {
    console.error("OTP ERROR:", error.code, error.message);
    throw error;
  }
};
