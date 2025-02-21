export class DashboardStats {
  constructor(
    private _totalTeams: number,
    private _totalPlayers: number,
    private _totalTournaments: number,
    private _totalGoals: number,
    private _totalMatches: number
  ) {}

  get totalTeams(): number {
    return this._totalTeams;
  }
  get totalPlayers(): number {
    return this._totalPlayers;
  }
  get totalTournaments(): number {
    return this._totalTournaments;
  }
  get totalGoals(): number {
    return this._totalGoals;
  }
  get totalMatches(): number {
    return this._totalMatches;
  }

  // Exemple: Actualitzar estadístiques
  updateStats(stats: Partial<{ 
    totalTeams: number; 
    totalPlayers: number; 
    totalTournaments: number; 
    totalGoals: number; 
    totalMatches: number 
  }>): void {
    if (stats.totalTeams !== undefined) this._totalTeams = stats.totalTeams;
    if (stats.totalPlayers !== undefined) this._totalPlayers = stats.totalPlayers;
    if (stats.totalTournaments !== undefined) this._totalTournaments = stats.totalTournaments;
    if (stats.totalGoals !== undefined) this._totalGoals = stats.totalGoals;
    if (stats.totalMatches !== undefined) this._totalMatches = stats.totalMatches;
  }
}
