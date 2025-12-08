const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Allows React to talk to Node
const votingRoutes = require('./routes/votingRoutes');
const { Candidate } = require('./Schemas');
const path = require('path');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Database Connection
// Replace <password> with your actual MongoDB password
const MONGO_URI = 'mongodb+srv://anshul:anshul@cluster0.fjmrsjw.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api', votingRoutes);

app.post('/seed', async (req, res) => {
  const candidates = [
    { name: "A", roll: "106121001" },
    { name: "B", roll: "106121045" },
    { name: "C", roll: "106121089" },
    { name: "D", roll: "106121102" }
  ];
  await Candidate.deleteMany({}); // Clear old data
  await Candidate.insertMany(candidates);
  res.json({ message: "Database seeded!" });
});


// GET /api/voters/:candidateRolls
// Example usage: GET /api/voters/2024001,2024005,2024099
app.get('/api/voters/:candidateRolls', async (req, res) => {
  try {
    const { candidateRolls } = req.params;

    // 1. Convert the comma-separated string into an array
    // Input: "101,102" -> Output: ["101", "102"]
    const candidateList = candidateRolls.split(',').map(roll => roll.trim());

    if (candidateList.length === 0) {
      return res.status(400).json({ error: "No candidate roll numbers provided" });
    }

    // 2. Fetch votes from the database
    // We look for any vote where the 'candidateRollNumber' matches our list
    const votes = await prisma.vote.findMany({
      where: {
        candidateRollNumber: {
          in: candidateList 
        }
      },
      select: {
        voterRollNumber: true,
        candidateRollNumber: true
      }
    });

    // 3. Group the results (Optional but recommended)
    // This turns a flat list into a nice dictionary: { "101": ["201", "202"], "102": ["205"] }
    const groupedResults = {};

    // Initialize keys for all requested candidates (so even those with 0 votes show up)
    candidateList.forEach(c => groupedResults[c] = []);

    // Fill in the voters
    votes.forEach(vote => {
      if (groupedResults[vote.candidateRollNumber]) {
        groupedResults[vote.candidateRollNumber].push(vote.voterRollNumber);
      }
    });

    return res.json({
      success: true,
      data: groupedResults
    });

  } catch (error) {
    console.error("Error fetching voters:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/test', async (req, res) => {
  
  res.json({ message: "Database seeded!" });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT,()=>{
    console.log("runnign")
})