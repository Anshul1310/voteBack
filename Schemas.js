// models/Schemas.js
const mongoose = require('mongoose');

// 1. Candidate Schema
const CandidateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  roll: { 
    type: String, 
    required: true, 
    unique: true 
  },
  votes: { 
    type: Number, 
    default: 0 
  }
});

// 2. Voter Schema
const VoterSchema = new mongoose.Schema({
  rollNumber: { 
    type: Number, 
    required: true, 
    unique: true,
    min: 1,
    max: 77 // Server-side validation matching your frontend
  },
  votedFor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', // Links to the Candidate model
    required: true
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const Candidate = mongoose.model('Candidate', CandidateSchema);
const Voter = mongoose.model('Voter', VoterSchema);

module.exports = { Candidate, Voter };