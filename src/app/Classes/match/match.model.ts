export class Match {
  id: number;
  homeTeamID: number;
  awayTeamID: number;
  homeGoals: number;
  awayGoals: number;
  currentMinute: number;
  tournamentID: number;
  matchDate: string;
  events: Array<{ minute: number; eventType: string; description: string; team: string }>;

  constructor(
    id: number,
    homeTeamID: number,
    awayTeamID: number,
    homeGoals: number,
    awayGoals: number,
    currentMinute: number,
    tournamentID: number,
    matchDate: string,
    events: Array<{ minute: number; eventType: string; description: string; team: string }> = []
  ) {
    this.id = id;
    this.homeTeamID = homeTeamID;
    this.awayTeamID = awayTeamID;
    this.homeGoals = homeGoals;
    this.awayGoals = awayGoals;
    this.currentMinute = currentMinute;
    this.tournamentID = tournamentID;
    this.matchDate = matchDate;
    this.events = events;
  }

  // Exemple: Afegir un esdeveniment al partit
  addEvent(event: { minute: number; eventType: string; description: string; team: string }): void {
    this.events.push(event);
  }
}
