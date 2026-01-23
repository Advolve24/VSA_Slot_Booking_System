const router = require("express").Router();
const ctrl = require("../controllers/payment.controller");

router.post("/order", ctrl.createOrder);
router.post("/verify", ctrl.verifyPayment);

module.exports = router;
