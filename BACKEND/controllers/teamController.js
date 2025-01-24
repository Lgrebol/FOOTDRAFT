import { createTeam, getAllTeams, getTeamById, deleteTeam } from "../models/teamModel.js";

export const addTeam = async (req, res) => {
  const { name } = req.body;

  try {
    await createTeam(name);
    res.status(201).json({ message: "Team created successfully" });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Error creating team" });
  }
};

export const listTeams = async (req, res) => {
  try {
    const teams = await getAllTeams();
    res.status(200).json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Error fetching teams" });
  }
};

export const removeTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    await deleteTeam(teamId);
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ error: "Error deleting team" });
  }
};
