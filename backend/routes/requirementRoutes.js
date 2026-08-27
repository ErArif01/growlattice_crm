const express = require("express");
const router = express.Router();
const {
  getRequirementOptions,
  createRequirementOption,
  deleteRequirementOption,
} = require("../controllers/requirementController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getRequirementOptions).post(createRequirementOption);
router.delete("/:id", deleteRequirementOption);

module.exports = router;
