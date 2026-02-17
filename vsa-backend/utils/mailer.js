const nodemailer = require("nodemailer");

/* =========================================================
   TRANSPORTER
========================================================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* =========================================================
   COMMON MOBILE FRIENDLY WRAPPER
========================================================= */
const wrapTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:20px 10px;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
${content}
</table>

<p style="font-size:12px;color:#888;margin-top:15px;">
© ${new Date().getFullYear()} Vidyanchal Sports Academy
</p>

</td>
</tr>
</table>

</body>
</html>
`;

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime12h = (time) => {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  let h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return minute === "00"
    ? `${h} ${ampm}`
    : `${h}:${minute} ${ampm}`;
};

/* =========================================================
   1️⃣ ENROLLMENT MAIL (UPDATED WITH DISCOUNT SUPPORT)
========================================================= */
exports.sendEnrollmentMail = async ({
  to,
  playerName,
  sportName,
  batchName,
  coachName,
  planType,
  schedule,
  slotTime,
  batchStartDate,
  batchEndDate,
  enrollmentStartDate,
  enrollmentEndDate,
  baseAmount = 0,
  totalDiscountAmount = 0,
  finalAmount,
  enrollmentId,
}) => {

  const paidAmount =
    finalAmount ?? baseAmount;

  const content = `
<tr>
<td style="background:linear-gradient(135deg,#16a34a,#22c55e);
           padding:30px 20px;text-align:center;color:white;">

  <h1 style="margin:0;font-size:20px;">
    Enrollment Confirmed 🎉
  </h1>

  <p style="margin:6px 0 0;font-size:13px;">
    Welcome to Vidyanchal Sports Academy
  </p>

  <div style="margin-top:15px;background:white;color:#16a34a;
              padding:6px 16px;border-radius:30px;
              font-size:12px;font-weight:bold;display:inline-block;">
    ₹${paidAmount} Paid Successfully
  </div>
</td>
</tr>

<tr>
<td style="padding:22px;">

  <p style="font-size:14px;margin-bottom:15px;">
    Hi <b>${playerName}</b> 👋
  </p>

  <!-- PROGRAM CARD -->
  <div style="background:#f3f4f6;padding:14px;border-radius:12px;margin-bottom:12px;">
    <strong style="font-size:15px;">
      ${sportName}
    </strong><br/>
    ${batchName}<br/>
    ${schedule}<br/>
    <span style="color:#16a34a;font-weight:bold;">
      Slot: ${slotTime ? formatTime12h(slotTime) : "-"}
    </span>
  </div>

  <!-- COACH -->
  <div style="margin-bottom:15px;font-size:13px;">
    <b>Coach:</b> ${coachName}<br/>
    <b>Plan:</b> ${planType?.toUpperCase() || "-"}
  </div>

  <!-- TRAINING SCHEDULE -->
  <table width="100%" cellpadding="8" cellspacing="0"
         style="text-align:center;font-size:12px;margin-bottom:15px;">
    <tr>
      <td style="background:#f3f4f6;border-radius:8px;">
        <small>Batch Start</small><br/>
        <strong>${formatDate(batchStartDate)}</strong>
      </td>
      <td style="background:#f3f4f6;border-radius:8px;">
        <small>Batch End</small><br/>
        <strong>${formatDate(batchEndDate)}</strong>
      </td>
    </tr>
  </table>

  <div style="font-size:13px;margin-bottom:15px;">
    <b>Enrollment Period:</b><br/>
    ${formatDate(enrollmentStartDate)} → ${formatDate(enrollmentEndDate)}
  </div>

  <!-- PAYMENT BREAKDOWN -->
  <div style="background:#f3f4f6;padding:14px;border-radius:12px;">
    <strong>Payment Summary</strong>

    <table width="100%" cellpadding="5" cellspacing="0"
           style="margin-top:8px;font-size:13px;">
      <tr>
        <td>Base Fee</td>
        <td align="right">₹${baseAmount}</td>
      </tr>

      ${
        totalDiscountAmount > 0
          ? `
      <tr>
        <td style="color:#16a34a;">Discount Applied</td>
        <td align="right" style="color:#16a34a;">
          - ₹${totalDiscountAmount}
        </td>
      </tr>`
          : ""
      }

      <tr>
        <td><strong>Total Paid</strong></td>
        <td align="right" style="color:#16a34a;">
          <strong>₹${paidAmount}</strong>
        </td>
      </tr>
    </table>
  </div>

  <p style="margin-top:15px;font-size:12px;color:#777;">
    Enrollment ID: <b>${enrollmentId}</b>
  </p>

</td>
</tr>
`;

  await transporter.sendMail({
    from: `"Vidyanchal Sports Academy" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Enrollment is Confirmed 🎉",
    html: wrapTemplate(content),
  });
};


/* =========================================================
   2️⃣ TURF BOOKING MAIL (UPDATED + DISCOUNT SUPPORT)
========================================================= */
exports.sendTurfBookingMail = async ({
  to,
  userName,
  facilityName,
  sportName,
  rentalDate,
  slots = [],
  baseAmount = 0,
  totalDiscountAmount = 0,
  finalAmount,
  bookingId,
}) => {

  const paidAmount =
    finalAmount ?? baseAmount;

  const formattedSlots = slots
    .map(formatTime12h)
    .join(", ");

  const content = `
<tr>
<td style="background:linear-gradient(135deg,#16a34a,#22c55e);
           padding:30px 20px;text-align:center;color:white;">

  <h1 style="margin:0;font-size:20px;">
    Turf Booking Confirmed ⚽
  </h1>

  <div style="margin-top:12px;background:white;color:#16a34a;
              padding:6px 16px;border-radius:30px;
              font-size:12px;font-weight:bold;display:inline-block;">
    ₹${paidAmount} Paid
  </div>
</td>
</tr>

<tr>
<td style="padding:22px;">

  <p style="font-size:14px;margin-bottom:15px;">
    Hi <b>${userName}</b> 👋
  </p>

  <!-- FACILITY -->
  <div style="background:#f3f4f6;padding:14px;border-radius:12px;margin-bottom:12px;">
    <strong style="font-size:15px;">
      ${facilityName}
    </strong><br/>
    ${sportName}
  </div>

  <table width="100%" cellpadding="8" cellspacing="0"
         style="text-align:center;font-size:12px;margin-bottom:15px;">
    <tr>
      <td style="background:#f3f4f6;border-radius:8px;">
        <small>Date</small><br/>
        <strong>${formatDate(rentalDate)}</strong>
      </td>
      <td style="background:#f3f4f6;border-radius:8px;">
        <small>Slots</small><br/>
        <strong>${formattedSlots || "-"}</strong>
      </td>
    </tr>
  </table>

  <!-- PAYMENT -->
  <div style="background:#f3f4f6;padding:14px;border-radius:12px;">
    <strong>Payment Summary</strong>

    <table width="100%" cellpadding="5" cellspacing="0"
           style="margin-top:8px;font-size:13px;">
      <tr>
        <td>Booking Fee</td>
        <td align="right">₹${baseAmount}</td>
      </tr>

      ${
        totalDiscountAmount > 0
          ? `
      <tr>
        <td style="color:#16a34a;">Discount</td>
        <td align="right" style="color:#16a34a;">
          - ₹${totalDiscountAmount}
        </td>
      </tr>`
          : ""
      }

      <tr>
        <td><strong>Total Paid</strong></td>
        <td align="right" style="color:#16a34a;">
          <strong>₹${paidAmount}</strong>
        </td>
      </tr>
    </table>
  </div>

  <p style="margin-top:15px;font-size:12px;color:#777;">
    Booking ID: <b>${bookingId}</b>
  </p>

</td>
</tr>
`;

  await transporter.sendMail({
    from: `"Vidyanchal Sports Academy" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Turf Booking is Confirmed ⚽",
    html: wrapTemplate(content),
  });
};
