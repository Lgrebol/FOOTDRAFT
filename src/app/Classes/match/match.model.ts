export interface MatchEvent {
  minute: number;
  eventType: string;
  description: string;
  team: string;
}

export class Match {
  constructor(
    private _id: string,
    private _homeTeamID: string,
    private _awayTeamID: string,
    private _homeGoals: number,
    private _awayGoals: number,
    private _currentMinute: number,
    private _tournamentID: string,
    private _matchDate: string,
    private _events: MatchEvent[] = []
  ) {}

  get id(): string { return this._id; }
  get homeTeamID(): string { return this._homeTeamID; }
  get awayTeamID(): string { return this._awayTeamID; }
  get homeGoals(): number { return this._homeGoals; }
  get awayGoals(): number { return this._awayGoals; }
  get currentMinute(): number { return this._currentMinute; }
  get tournamentID(): string { return this._tournamentID; }
  get matchDate(): string { return this._matchDate; }
  get events(): MatchEvent[] { return this._events; }

  addEvent(event: MatchEvent): void {
    this._events.push(event);
  }

  isMatchEnded(): boolean {
    return this._currentMinute > 90;
  }

  getSummary(): {
    homeGoals: number;
    awayGoals: number;
    totalGoals: number;
    totalFouls: number;
    totalRedCards: number;
    matchEnded: boolean;
    message: string;
  } {
    const totalFouls = this._events.filter(e => e.eventType === 'Falta').length;
    const totalRedCards = this._events.filter(e => e.eventType === 'Vermella').length;
    return {
      homeGoals: this._homeGoals,
      awayGoals: this._awayGoals,
      totalGoals: this._homeGoals + this._awayGoals,
      totalFouls: totalFouls,
      totalRedCards: totalRedCards,
      matchEnded: this.isMatchEnded(),
      message: "El partit ha finalitzat!"
    };
  }

  static fromApi(data: any): Match {
    return new Match(
      data.MatchID || data.id,
      data.HomeTeamID,
      data.AwayTeamID,
      data.HomeGoals,
      data.AwayGoals,
      data.CurrentMinute,
      data.TournamentID,
      data.MatchDate,
      data.events || []
    );
  }
}
