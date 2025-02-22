export interface MatchEvent {
  minute: number;
  eventType: string;
  description: string;
  team: string;
}

export class Match {
  constructor(
    private _id: string,
    private _homeTeamUUID: string,
    private _awayTeamUUID: string,
    private _homeGoals: number,
    private _awayGoals: number,
    private _currentMinute: number,
    private _tournamentUUID: string,
    private _matchDate: string,
    private _events: MatchEvent[] = []
  ) {}

  get id(): string { return this._id; }
  get homeTeamUUID(): string { return this._homeTeamUUID; } 
  get awayTeamUUID(): string { return this._awayTeamUUID; } 
  get matchUUID(): string { return this._id; }
  get homeGoals(): number { return this._homeGoals; }
  get awayGoals(): number { return this._awayGoals; }
  get currentMinute(): number { return this._currentMinute; }
  get tournamentUUID(): string { return this._tournamentUUID; }
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
      data.MatchUUID || data.id,
      data.HomeTeamUUID,
      data.AwayTeamUUID,
      data.HomeGoals,
      data.AwayGoals,
      data.CurrentMinute,
      data.TournamentUUID,
      data.MatchDate,
      data.events || []
    );
  }
}
