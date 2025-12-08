const express = require('express');
const router = express.Router();
const { Candidate, Voter } = require('../Schemas');

// 1. GET ALL CANDIDATES (For Leaderboard)
router.get('/candidates', async (req, res) => {
  try {
    // Sort by votes (descending) automatically
    const candidates = await Candidate.find().sort({ votes: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. CHECK VOTER STATUS (When user types roll number)
router.get('/status/:rollNumber', async (req, res) => {
  try {
    const rollNumber = Number(req.params.rollNumber);
    const voter = await Voter.findOne({ rollNumber }).populate('votedFor');
    
    if (voter) {
      // Return who they voted for previously
      res.json({ hasVoted: true, votedFor: voter.votedFor });
    } else {
      res.json({ hasVoted: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. CAST OR CHANGE VOTE (The Main Logic)
router.post('/vote', async (req, res) => {
  const { rollNumber, candidateId } = req.body;
  const roll = Number(rollNumber);

  // Server-side Validation
  if (!roll || roll < 1 || roll > 77) {
    return res.status(400).json({ message: "Invalid Roll Number (Must be 1-77)" });
  }

  try {
    // Check if this student already voted
    const existingVoter = await Voter.findOne({ rollNumber: roll });

    // --- SCENARIO A: CHANGING VOTE ---
    if (existingVoter) {
      const oldCandidateId = existingVoter.votedFor;

      // Prevent voting for the same person again
      if (oldCandidateId.toString() === candidateId) {
        return res.status(400).json({ message: "You already voted for this candidate!" });
      }

      // 1. Decrement old candidate
      await Candidate.findByIdAndUpdate(oldCandidateId, { $inc: { votes: -1 } });
      
      // 2. Increment new candidate
      await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });
      
      // 3. Update voter record
      existingVoter.votedFor = candidateId;
      await existingVoter.save();

      return res.json({ message: "Vote changed successfully!" });
    }

    // --- SCENARIO B: FRESH VOTE ---
    else {
      // 1. Create new voter record
      const newVoter = new Voter({
        rollNumber: roll,
        votedFor: candidateId
      });
      await newVoter.save();

      // 2. Increment candidate votes
      await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });

      return res.json({ message: "Vote cast successfully!" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;