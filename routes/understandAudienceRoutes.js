const express = require("express");
const { generateUnderstandAudience, getUserData, deleteUserData } = require("../controller/understandAudienceController");
const authenticateUser = require("../middleware/middleware")

const router = express.Router();

// POST route to generate AI response based on QA pairs
router.post("/", authenticateUser,generateUnderstandAudience);

// GET route to fetch user data by email
router.get("/user/:email", authenticateUser,getUserData);

// DELETE route to delete user data
router.delete("/user/:email", authenticateUser,deleteUserData);

module.exports = router;
