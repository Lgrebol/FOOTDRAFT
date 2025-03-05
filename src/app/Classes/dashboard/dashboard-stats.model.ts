export class DashboardStats{
  private _totalTeams: number = 0;
  private _totalPlayers: number = 0;
  private _totalTournaments: number = 0;
  private _totalGoals: number = 0;
  private _totalMatches: number = 0;
  
  loading: boolean = false;
  error: string | null = null;

  constructor() {}

  get totalTeams(): number { return this._totalTeams; }
  get totalPlayers(): number { return this._totalPlayers; }
  get totalTournaments(): number { return this._totalTournaments; }
  get totalGoals(): number { return this._totalGoals; }
  get totalMatches(): number { return this._totalMatches; }

  updateStats(stats: Partial<{ totalTeams: number; totalPlayers: number; totalTournaments: number; totalGoals: number; totalMatches: number; }>): void {
    if (stats.totalTeams !== undefined) { this._totalTeams = stats.totalTeams; }
    if (stats.totalPlayers !== undefined) { this._totalPlayers = stats.totalPlayers; }
    if (stats.totalTournaments !== undefined) { this._totalTournaments = stats.totalTournaments; }
    if (stats.totalGoals !== undefined) { this._totalGoals = stats.totalGoals; }
    if (stats.totalMatches !== undefined) { this._totalMatches = stats.totalMatches; }
  }

  setLoading(loading: boolean): void { this.loading = loading; }
  setError(error: string | null): void { this.error = error; }
}
