import { RAZORPAY_KEY } from "../lib/env";

export default function useRazorpay() {
  const openRazorpay = ({ amount, orderId, onSuccess }) => {
    const options = {
      key: RAZORPAY_KEY,
      amount,
      currency: "INR",
      name: "Vidyanchal Sports Academy",
      order_id: orderId,
      handler: function (response) {
        onSuccess(response);
      },
      theme: { color: "#106920" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return { openRazorpay };
}
