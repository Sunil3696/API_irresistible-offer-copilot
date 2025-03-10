const express = require("express");
const { generateUnderstandAudience, getUserData, deleteUserData } = require("../controller/understandAudienceController");

const router = express.Router();

// POST route to generate AI response based on QA pairs
router.post("/", generateUnderstandAudience);

// GET route to fetch user data by email
router.get("/user/:email", getUserData);

// DELETE route to delete user data
router.delete("/user/:email", deleteUserData);

module.exports = router;
