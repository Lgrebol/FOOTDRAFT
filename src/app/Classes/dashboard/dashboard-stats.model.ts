export class DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  totalTournaments: number;
  totalGoals: number;
  totalMatches: number;

  constructor(
    totalTeams: number,
    totalPlayers: number,
    totalTournaments: number,
    totalGoals: number,
    totalMatches: number
  ) {
    this.totalTeams = totalTeams;
    this.totalPlayers = totalPlayers;
    this.totalTournaments = totalTournaments;
    this.totalGoals = totalGoals;
    this.totalMatches = totalMatches;
  }

  // Exemple: Actualitzar estadístiques
  updateStats(stats: Partial<DashboardStats>): void {
    Object.assign(this, stats);
  }
}
