const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Allows React to talk to Node
const votingRoutes = require('./routes/votingRoutes');
const { Candidate } = require('./Schemas');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Database Connection
// Replace <password> with your actual MongoDB password
const MONGO_URI = 'mongodb+srv://anshul:anshul@indulge.jbvxebp.mongodb.net/?appName=indulge';

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


app.get('/test', async (req, res) => {
  
  res.json({ message: "Database seeded!" });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT,()=>{
    console.log("runnign")
})