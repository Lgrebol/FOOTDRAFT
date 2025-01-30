import connectDb from "../config/db.js";
import sql from "mssql";

// Crear un torneig
export const createTournament = async (tournamentName, tournamentType, startDate, endDate) => {
    const pool = await connectDb();
    await pool
        .request()
        .input("tournamentName", sql.VarChar, tournamentName)
        .input("tournamentType", sql.VarChar, tournamentType)
        .input("startDate", sql.Date, startDate)
        .input("endDate", sql.Date, endDate)
        .query(
            "INSERT INTO Tournaments (TournamentName, TournamentType, StartDate, EndDate) VALUES (@tournamentName, @tournamentType, @startDate, @endDate)"
        );
};

// Obtenir tots els torneigs
export const getAllTournaments = async () => {
    const pool = await connectDb();
    const result = await pool.request().query("SELECT * FROM Tournaments");
    return result.recordset;
};

// Obtenir un torneig per ID
export const getTournamentById = async (tournamentId) => {
    const pool = await connectDb();
    const result = await pool
        .request()
        .input("tournamentId", sql.Int, tournamentId)
        .query("SELECT * FROM Tournaments WHERE TournamentID = @tournamentId");
    return result.recordset[0];
};

// Esborrar un torneig
export const deleteTournament = async (tournamentId) => {
    const pool = await connectDb();
    await pool
        .request()
        .input("tournamentId", sql.Int, tournamentId)
        .query("DELETE FROM Tournaments WHERE TournamentID = @tournamentId");
};

// Inscriure un equip a un torneig
export const registerTeamToTournament = async (teamId, tournamentId) => {
    const pool = await connectDb();
    await pool
        .request()
        .input("teamId", sql.Int, teamId)
        .input("tournamentId", sql.Int, tournamentId)
        .query(
            "INSERT INTO Teams_Tournaments (TeamID, TournamentID) VALUES (@teamId, @tournamentId)"
        );
};
