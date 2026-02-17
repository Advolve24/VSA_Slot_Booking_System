const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discount.controller");

/* CREATE */
router.post("/", discountController.createDiscount);

/* GET ALL */
router.get("/", discountController.getDiscounts);

/* GET SINGLE */
router.get("/:id", discountController.getDiscountById);

/* UPDATE */
router.put("/:id", discountController.updateDiscount);

/* DELETE */
router.delete("/:id", discountController.deleteDiscount);

router.post("/preview", discountController.previewDiscount);

module.exports = router;
