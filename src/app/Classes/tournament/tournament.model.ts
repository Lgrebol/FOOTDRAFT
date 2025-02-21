export class Tournament {
  constructor(
    private _id: string,
    private _tournamentName: string,
    private _tournamentType: string,
    private _startDate: string,
    private _endDate: string
  ) {}

  get id(): string {
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

  getDuration(): number {
    const start = new Date(this._startDate);
    const end = new Date(this._endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}