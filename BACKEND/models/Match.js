// models/Match.js
import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  homeTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  awayTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  matchDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  homeGoals: {
    type: Number,
    default: 0,
  },
  awayGoals: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Match", matchSchema);