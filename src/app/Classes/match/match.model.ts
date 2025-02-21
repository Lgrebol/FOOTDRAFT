export class Match {
  constructor(
    private _id: number,
    private _homeTeamID: number,
    private _awayTeamID: number,
    private _homeGoals: number,
    private _awayGoals: number,
    private _currentMinute: number,
    private _tournamentID: number,
    private _matchDate: string,
    private _events: Array<{ minute: number; eventType: string; description: string; team: string }> = []
  ) {}

  get id(): number {
    return this._id;
  }
  get homeTeamID(): number {
    return this._homeTeamID;
  }
  get awayTeamID(): number {
    return this._awayTeamID;
  }
  get homeGoals(): number {
    return this._homeGoals;
  }
  get awayGoals(): number {
    return this._awayGoals;
  }
  get currentMinute(): number {
    return this._currentMinute;
  }
  get tournamentID(): number {
    return this._tournamentID;
  }
  get matchDate(): string {
    return this._matchDate;
  }
  get events(): Array<{ minute: number; eventType: string; description: string; team: string }> {
    return this._events;
  }

  // Exemple: Afegir un esdeveniment al partit
  addEvent(event: { minute: number; eventType: string; description: string; team: string }): void {
    this._events.push(event);
  }
}
