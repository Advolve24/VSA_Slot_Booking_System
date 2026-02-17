import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

/* =========================================================
   FIREBASE CONFIG
========================================================= */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

/* =========================================================
   INIT APP
========================================================= */
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/* =========================================================
   SAFE GLOBAL RECAPTCHA HANDLING
========================================================= */

const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        },
      }
    );
  }

  return window.recaptchaVerifier;
};

/* =========================================================
   SEND OTP (PRODUCTION SAFE)
========================================================= */
export const sendOtp = async (phone) => {
  try {
    if (!phone.startsWith("+")) {
      throw new Error("Phone number must include country code");
    }

    const appVerifier = setupRecaptcha();

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      appVerifier
    );

    return confirmationResult;
  } catch (error) {
    console.error(
      "OTP ERROR:",
      error.code,
      error.message
    );
    throw error;
  }
};

/* =========================================================
   OPTIONAL: CLEAR RECAPTCHA (CALL ON LOGOUT / MODAL CLOSE)
========================================================= */
export const clearRecaptcha = () => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
};
