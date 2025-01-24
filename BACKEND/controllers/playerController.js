import { createPlayer, getAllPlayers, getPlayersByTeam, deletePlayer } from "../models/playerModel.js";
import { getTeamById } from "../models/teamModel.js";

export const addPlayer = async (req, res) => {
  const { name, position, teamId } = req.body;

  try {
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(400).json({ error: "Team does not exist" });
    }

    await createPlayer(name, position, teamId);
    res.status(201).json({ message: "Player created successfully" });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ error: "Error creating player" });
  }
};

export const listPlayers = async (req, res) => {
  try {
    const players = await getAllPlayers();
    res.status(200).json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: "Error fetching players" });
  }
};

export const listPlayersByTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    const players = await getPlayersByTeam(teamId);
    res.status(200).json(players);
  } catch (error) {
    console.error("Error fetching players by team:", error);
    res.status(500).json({ error: "Error fetching players by team" });
  }
};

export const removePlayer = async (req, res) => {
  const { playerId } = req.params;

  try {
    await deletePlayer(playerId);
    res.status(200).json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    res.status(500).json({ error: "Error deleting player" });
  }
};
