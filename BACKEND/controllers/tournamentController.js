import { createTournament, getAllTournaments, getTournamentById, deleteTournament, registerTeamToTournament } from "../models/tournamentModel.js";
import connectDb from "../config/db.js";
import sql from "mssql";

export const createTournamentController = async (req, res) => {
    const { tournamentName, tournamentType, startDate, endDate } = req.body;

    if (!tournamentName || !tournamentType || !startDate) {
        return res.status(400).send({ error: "Falten camps obligatoris." });
    }

    try {
        await createTournament(tournamentName, tournamentType, startDate, endDate);
        res.status(201).send({ message: "Torneig creat correctament." });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

export const getTournamentsController = async (req, res) => {
    try {
        const tournaments = await getAllTournaments();
        res.status(200).json(tournaments);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

export const getTournamentByIdController = async (req, res) => {
    const { id } = req.params;
    try {
        const tournament = await getTournamentById(id);
        if (!tournament) {
            return res.status(404).send({ error: "Torneig no trobat." });
        }
        res.status(200).json(tournament);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

export const deleteTournamentController = async (req, res) => {
    const { id } = req.params;
  
    try {
      const pool = await connectDb();
      
      // Iniciem una transacció
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
  
      try {
        await transaction.request()
          .input("tournamentUUID", sql.UniqueIdentifier, id)
          .query("DELETE FROM Matches WHERE TournamentUUID = @tournamentUUID");
  
        await transaction.request()
          .input("tournamentUUID", sql.UniqueIdentifier, id)
          .query("DELETE FROM Tournaments WHERE TournamentUUID = @tournamentUUID");
  
        await transaction.commit();
        res.status(200).send({ message: "Torneig i els partits associats eliminats correctament." });
      } catch (transactionError) {
        await transaction.rollback();
        console.error("Error en la transacció d'eliminació:", transactionError);
        res.status(500).send({ error: "Error eliminant torneig (rollback)." });
      }
      
    } catch (err) {
      console.error("Error eliminant torneig:", err);
      res.status(500).send({ error: err.message });
    }
  };
  

export const registerTeamToTournamentController = async (req, res) => {
    const { teamId, tournamentId } = req.body;

    if (!teamId || !tournamentId) {
        return res.status(400).send({ error: "Falten camps obligatoris." });
    }

    try {
        await registerTeamToTournament(teamId, tournamentId);
        res.status(201).send({ message: "Equip inscrit al torneig correctament." });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};
