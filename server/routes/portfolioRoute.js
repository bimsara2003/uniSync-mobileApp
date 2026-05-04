const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  uploadPortfolioImage,
  getMyPortfolio,
  getPortfolioByUserId,
  updateMyPortfolio,
  createPortfolioItem,
  getMyPortfolioItems,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
} = require("../controllers/portfolio/portfolioController");

// ─── PORTFOLIO PROFILE ──────────────────────────────────
// Static paths come before /:userId to avoid param conflict

router.get("/me", protect, getMyPortfolio);
router.put("/me", protect, uploadPortfolioImage.single("image"), updateMyPortfolio);
router.get("/user/:userId", protect, getPortfolioByUserId);

// ─── PORTFOLIO ITEMS ─────────────────────────────────────

router.post(
  "/items",
  protect,
  uploadPortfolioImage.single("image"),
  createPortfolioItem
);
router.get("/items", protect, getMyPortfolioItems);
router.get("/items/:id", protect, getPortfolioItemById);
router.put(
  "/items/:id",
  protect,
  uploadPortfolioImage.single("image"),
  updatePortfolioItem
);
router.delete("/items/:id", protect, deletePortfolioItem);

module.exports = router;
