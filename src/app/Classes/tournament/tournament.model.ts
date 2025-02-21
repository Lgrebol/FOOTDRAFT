export class Tournament {
  constructor(
    private _id: number,
    private _tournamentName: string,
    private _tournamentType: string,
    private _startDate: string,
    private _endDate: string
  ) {}

  get id(): number {
    return this._id;
  }
  get tournamentName(): string {
    return this._tournamentName;
  }
  get tournamentType(): string {
    return this._tournamentType;
  }
  get startDate(): string {
    return this._startDate;
  }
  get endDate(): string {
    return this._endDate;
  }

  // Exemple: Calcular la durada del torneig en dies
  getDuration(): number {
    const start = new Date(this._startDate);
    const end = new Date(this._endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
