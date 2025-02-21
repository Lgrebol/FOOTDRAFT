export class Team {
  constructor(
    private _id: string,
    private _teamName: string,
    private _shirtColor: string,
    private _userID: string,
    private _username?: string
  ) {}

  get id(): string {
    return this._id;
  }
  get teamName(): string {
    return this._teamName;
  }
  get shirtColor(): string {
    return this._shirtColor;
  }
  get userID(): string {
    return this._userID;
  }
  get username(): string | undefined {
    return this._username;
  }

  displayInfo(): string {
    return `${this._teamName} - ${this._shirtColor}`;
  }
}
