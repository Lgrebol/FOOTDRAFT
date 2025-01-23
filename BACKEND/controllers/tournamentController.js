import * as TournamentModel from "../models/tournamentModel.js";

export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await TournamentModel.getAllTournaments();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: "Error obtenint tornejos" });
  }
};

export const getTournamentById = async (req, res) => {
  try {
    const tournament = await TournamentModel.getTournamentById(req.params.id);
    if (!tournament) return res.status(404).json({ error: "Torneig no trobat" });
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: "Error obtenint el tornejos" });
  }
};

export const createTournament = async (req, res) => {
  try {
    const newTournament = await TournamentModel.createTournament(req.body);
    res.status(201).json(newTournament);
  } catch (error) {
    res.status(500).json({ error: "Error creant el tornejos" });
  }
};

export const updateTournament = async (req, res) => {
  try {
    await TournamentModel.updateTournament(req.params.id, req.body);
    res.json({ message: "Torneig actualitzat correctament" });
  } catch (error) {
    res.status(500).json({ error: "Error actualitzant el tornejos" });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    await TournamentModel.deleteTournament(req.params.id);
    res.json({ message: "Torneig eliminat correctament" });
  } catch (error) {
    res.status(500).json({ error: "Error eliminant el tornejos" });
  }
};
