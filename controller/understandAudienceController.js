const axios = require("axios");
const UnderstandAudience = require("../models/UnderstandAudience");
const { MongoClient } = require("mongodb");
require('dotenv').config();
const uri = process.env.MONGO_URI;
const dbName = "AI_PORTAL"; // change if yours is different
// Generate GPT-based response and save
const generateUnderstandAudience = async (req, res) => {
  const { formData } = req.body;
const qaPairs = formData
  const email = req.user.email;
  const selectedAssets = req.body?.selectedAssets
console.log
  if (selectedAssets && Array.isArray(selectedAssets)) {
    const previewText = selectedAssets
      .map(asset => {
        const category = asset.category || 'Unknown Category';
        const content = asset.content || 'not given';
        return `${category}: ${content}`;
      })
      .join(' and ');
  
    console.log("Preview Text:", previewText);
  }

  try {
    // Format QA for GPT
    const formattedQA = qaPairs.map((pair, index) =>
      `Q${index + 1}: ${pair.question}\nA${index + 1}: ${pair.answer}`
    ).join('\n\n');

    const prompt = [
      {
        role: "system",
        content: "You're a marketing strategist. Format response in markdown with proper line breaks and headers."
      },
      {
        role: "user",
        content: `Here are my questions and answers: ${formattedQA} and use this prompt to generate the output Using the student's answers to the questions provided, create a tailored response that includes the following outputs in this structure:

Structure of an Irresistible Offer
Clarity: The offer must be immediately understandable
Grounded in desire: Focused on what people actually want
System-based: Contains a clear methodology or process
Social proof: Includes testimonials, success stories, or credentials
Connected to high values: Links to what the target audience truly cares about
Unique opportunities: Offers something exclusive or special


Irresistible Offer Structure
1. Headline & Promise
Clear, compelling statement of the transformation or outcome
Addresses a specific desire or pain point that the ideal client desperately wants solved
2. Problem Definition
Articulates the problem in your client's language
Demonstrates deep understanding of their situation and frustrations
Creates emotional resonance by validating their experience
3. Solution Framework
Presents your systematic approach or methodology
Shows clear steps from current state to desired outcome
Explains why your approach works when others have failed
4. Value Components
Core offering: What they'll receive (deliverables, access, resources)
Implementation support: How they'll be guided through the process
Bonuses: Additional valuable elements that enhance the offer
Unexpected extras: Surprise elements that create delight
5. Social Proof
Testimonials from similar clients who achieved desired results
Case studies showing the transformation process
Credentials or experience that establish your authority
6. Unique Opportunities
Exclusive access or experiences unavailable elsewhere
Limited availability elements (time, spots, special conditions)
Connection to high values your client prioritizes
7. Risk Reversal
Guarantee or assurance that reduces perceived risk
Clear terms that create confidence in the decision
8. Investment & Value Justification
Price positioned against the value of solving the problem
Comparison to alternatives (including doing nothing)
Payment options that facilitate decision-making
9. Clear Next Steps
Exactly what happens after they say "yes"
Simple process to get started immediately
`
      }
    ];

    // console.log(prompt)

    // Call GPT API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: prompt,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const gptContent = response.data.choices[0].message.content;

    // Upsert user data
    const updatedDoc = await UnderstandAudience.findOneAndUpdate(
      { email },
      {
        qaPairs,
        gptResponse: gptContent,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ answer: gptContent ,
        usages: response.data.usage
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate audience insight" });
  }
};

// Fetch user data
const getUserData = async (req, res) => {
  const email = req.user.email;

  try {
    const userData = await UnderstandAudience.findOne({ email });
    if (userData) {
      res.json(userData);
    } else {
      res.status(404).json({ message: "User data not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

// Delete user data
const deleteUserData = async (req, res) => {
  const email = req.user.email;

  try {
    const result = await UnderstandAudience.updateOne(
      { email: email },
      { $unset: { gptResponse: "" } } 
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "User data reset successfully" });
    } else {
      res.status(404).json({ message: "User data not found" });
    }
  } catch (error) {
    console.error("Error resetting user data:", error);
    res.status(500).json({ error: "Failed to reset user data" });
  }
};


const getUserassets = async (req, res) => {
  const client = new MongoClient(uri);
  const email = req.user.email;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    await client.connect();
    const db = client.db(dbName);

    // Define the collections you want to extract gptResponse from
    const collections = [
      "valuepropositions",
      "targetmarkets",
      "trafficsources",
      "understandaudiences",
      "valueladders",
      "businessstrategies",
      "fyscopilots",
      "fycniches",
      "fycopilots",
      "fyconsultingniches"
    ];

    const result = {};

    // Loop through each collection and pull gptResponse fields
    for (const collectionName of collections) {
      const data = await db.collection(collectionName)
        .find({ email }, { projection: { gptResponse: 1 } })
        .toArray();

      // Filter only documents that contain gptResponse
      result[collectionName] = data
        .filter(item => item.gptResponse)
        .map(item => item.gptResponse);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching GPT responses:", error);
    res.status(500).json({ msg: "Internal server error" });
  } finally {
    await client.close();
  }
};

module.exports = { generateUnderstandAudience, getUserData, deleteUserData , getUserassets};
