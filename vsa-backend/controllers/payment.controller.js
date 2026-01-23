const Razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");

exports.createOrder = async (req, res) => {
  const amount = req.body.amount * 100;

  const order = await Razorpay.orders.create({
    amount,
    currency: "INR",
  });

  res.json(order);
};

exports.verifyPayment = async (req, res) => {
  const payment = await Payment.create(req.body);
  res.json(payment);
};
