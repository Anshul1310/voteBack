const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Allows React to talk to Node
const votingRoutes = require('./routes/votingRoutes');
const { Candidate, Voter } = require('./Schemas');
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

app.get('/seed', async (req, res) => {
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


app.get('/reset', async (req, res) => {
  
  // --- SECURITY: Simple Password Check ---
  // You don't want random people wiping your database!

  // ---------------------------------------

  try {
    // 1. Delete ALL documents in the 'votes' collection
    // Passing an empty object {} selects everything.
    await Voter.deleteMany({});
    await Candidate.deleteMany({})
    // 2. Respond with success
    res.status(200).json({
      success: true,
      message: "Election reset successful. All votes have been cleared.",
      deletedCount: result.deletedCount // Shows how many votes were removed
    });

  } catch (err) {
    console.error("Reset Error:", err);
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