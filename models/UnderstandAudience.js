const mongoose = require("mongoose");

const questionAnswerSchema = new mongoose.Schema({
  questionId: Number,
  category: String,
  question: String,
  answer: String
});

const understandAudienceSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  qaPairs: [questionAnswerSchema],
  gptResponse: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const UnderstandAudience = mongoose.model("UnderstandAudience", understandAudienceSchema);

module.exports = UnderstandAudience;
