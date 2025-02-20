export class DashboardStats {
  constructor(
    public totalTeams: number,
    public totalPlayers: number,
    public totalTournaments: number,
    public totalGoals: number,
    public totalMatches: number
  ) {}

  // Exemple: Actualitzar estadístiques
  updateStats(stats: Partial<DashboardStats>): void {
    Object.assign(this, stats);
  }
}
