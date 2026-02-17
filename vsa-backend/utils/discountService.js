const Discount = require("../models/Discount");

async function applyDiscount({
  amount,
  type,          // "enrollment" or "turf"
  planType = null,
  slots = 0,
  code = null,
  sportId = null,
  batchId = null,
}) {
  const today = new Date();

  /* ======================================================
     BUILD BASE QUERY
  ====================================================== */

  const baseQuery = {
    applicableFor: type,
    isActive: true,
    $or: [
      { validFrom: null },
      { validFrom: { $lte: today } },
    ],
    $and: [
      {
        $or: [
          { validTill: null },
          { validTill: { $gte: today } },
        ],
      },
    ],
  };

  // Code based
  if (code) {
    baseQuery.code = code.toUpperCase();
  } else {
    baseQuery.code = null; // auto discounts only
  }

  const discounts = await Discount.find(baseQuery);

  let bestDiscountAmount = 0;
  let bestDiscount = null;

  /* ======================================================
     CHECK EACH DISCOUNT
  ====================================================== */

  for (const d of discounts) {

    // Plan type check (for enrollment)
    if (d.planType && d.planType !== planType) continue;

    // Slot check (for turf)
    if (d.minSlots && slots < d.minSlots) continue;

    // Sport specific check
    if (d.sportId && sportId && d.sportId.toString() !== sportId.toString()) {
      continue;
    }

    // Batch specific check
    if (d.batchId && batchId && d.batchId.toString() !== batchId.toString()) {
      continue;
    }

    let discountAmount = 0;

    if (d.type === "percentage") {
      discountAmount = (amount * d.value) / 100;
    } else {
      discountAmount = d.value;
    }

    if (discountAmount > bestDiscountAmount) {
      bestDiscountAmount = discountAmount;
      bestDiscount = d;
    }
  }

  const finalAmount = Math.max(0, amount - bestDiscountAmount);

  return {
    baseAmount: amount,
    discountAmount: bestDiscountAmount,
    finalAmount,
    discountId: bestDiscount?._id || null,
    appliedDiscount: bestDiscount || null,
  };
}

module.exports = { applyDiscount };
