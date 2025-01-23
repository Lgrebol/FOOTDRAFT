import * as TeamModel from "../models/teamModel.js";

export const getAllTeams = async (req, res) => {
  try {
    const teams = await TeamModel.getAllTeams();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: "Error obtenint equips" });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await TeamModel.getTeamById(req.params.id);
    if (!team) return res.status(404).json({ error: "Equip no trobat" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: "Error obtenint l'equip" });
  }
};

export const createTeam = async (req, res) => {
  try {
    const newTeam = await TeamModel.createTeam(req.body);
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: "Error creant l'equip" });
  }
};

export const updateTeam = async (req, res) => {
  try {
    await TeamModel.updateTeam(req.params.id, req.body);
    res.json({ message: "Equip actualitzat correctament" });
  } catch (error) {
    res.status(500).json({ error: "Error actualitzant l'equip" });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    await TeamModel.deleteTeam(req.params.id);
    res.json({ message: "Equip eliminat correctament" });
  } catch (error) {
    res.status(500).json({ error: "Error eliminant l'equip" });
  }
};
