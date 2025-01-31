import { createTournament, getAllTournaments, getTournamentById, deleteTournament, registerTeamToTournament } from "../models/tournamentModel.js";

// Crear un torneig
export const createTournamentController = async (req, res) => {
    console.log("Dades rebudes per crear torneig:", req.body); // 🔍 Veure què arriba a la petició

    const { tournamentName, tournamentType, startDate, endDate } = req.body;

    if (!tournamentName || !tournamentType || !startDate) {
        console.error("❌ Error: Falten camps obligatoris:", req.body);
        return res.status(400).send({ error: "Falten camps obligatoris." });
    }

    try {
        await createTournament(tournamentName, tournamentType, startDate, endDate);
        res.status(201).send({ message: "Torneig creat correctament." });
    } catch (err) {
        console.error("❌ Error en crear torneig:", err);
        res.status(500).send({ error: err.message });
    }
};


// Obtenir tots els torneigs
export const getTournamentsController = async (req, res) => {
    try {
        const tournaments = await getAllTournaments();
        res.status(200).json(tournaments);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

// Obtenir un torneig per ID
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

// Esborrar un torneig
export const deleteTournamentController = async (req, res) => {
    const { id } = req.params;

    try {
        await deleteTournament(id);
        res.status(200).send({ message: "Torneig eliminat correctament." });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

// Inscriure un equip a un torneig
export const registerTeamToTournamentController = async (req, res) => {
    console.log("Dades rebudes:", req.body); // Debug per veure què arriba

    const { teamId, tournamentId } = req.body;

    if (!teamId || !tournamentId) {
        console.error("Falten camps obligatoris:", { teamId, tournamentId });
        return res.status(400).send({ error: "Falten camps obligatoris." });
    }

    try {
        await registerTeamToTournament(teamId, tournamentId);
        res.status(201).send({ message: "Equip inscrit al torneig correctament." });
    } catch (err) {
        console.error("Error al registrar l'equip:", err); // Debug per errors al servidor
        res.status(500).send({ error: err.message });
    }
};
