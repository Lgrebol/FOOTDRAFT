import * as PlayerModel from "../models/playerModel.js"; // Importa els models de players

export const getAllPlayers = async (req, res) => {
  try {
    const players = await PlayerModel.getAllPlayers();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: "Error obtenint jugadors" });
  }
};

export const getPlayerById = async (req, res) => {
  try {
    const player = await PlayerModel.getPlayerById(req.params.id);
    if (!player) return res.status(404).json({ error: "Jugador no trobat" });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: "Error obtenint el jugador" });
  }
};

export const addPlayer = async (req, res) => {
  try {
    const newPlayer = await PlayerModel.createPlayer(req.body);
    res.status(201).json(newPlayer); // Retorna el nou jugador creat
  } catch (error) {
    res.status(500).json({ error: "Error creant jugador" });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    await PlayerModel.updatePlayer(req.params.id, req.body);
    res.json({ message: "Jugador actualitzat correctament" });
  } catch (error) {
    res.status(500).json({ error: "Error actualitzant el jugador" });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    await PlayerModel.deletePlayer(req.params.id);
    res.json({ message: "Jugador eliminat correctament" });
  } catch (error) {
    res.status(500).json({ error: "Error eliminant el jugador" });
  }
};
