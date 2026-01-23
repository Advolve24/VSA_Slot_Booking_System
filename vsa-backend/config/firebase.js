const admin = require("firebase-admin");

let serviceAccount;

// ✅ Production / Render (ENV based)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} 
// ✅ Local development fallback
else {
  serviceAccount = require("../firebase-service.json");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
