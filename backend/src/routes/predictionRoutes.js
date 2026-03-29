const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  createPrediction, getPredictions, updateResult, deletePrediction
} = require("../controllers/predictionController");

// All authenticated users can GET predictions
router.get("/", auth, getPredictions);

// Only ADMIN can create/update/delete
router.post("/",        auth, requireRole(["ADMIN"]), createPrediction);
router.patch("/:id",   auth, requireRole(["ADMIN"]), updateResult);
router.delete("/:id",  auth, requireRole(["ADMIN"]), deletePrediction);

module.exports = router;
