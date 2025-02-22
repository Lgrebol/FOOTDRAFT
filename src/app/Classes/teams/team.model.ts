export class Team {
  constructor(
    private _id: string = '',
    private _teamName: string = '',
    private _shirtColor: string = '',
    private _userID: string = '',
    private _username?: string
  ) {}

  // Getters
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

  // Setters
  set teamName(value: string) {
    this._teamName = value;
  }
  set shirtColor(value: string) {
    this._shirtColor = value;
  }
  set userID(value: string) {
    this._userID = value;
  }
  set username(value: string | undefined) {
    this._username = value;
  }

  displayInfo(): string {
    return `${this._teamName} - ${this._shirtColor}`;
  }

  toPayload(): { teamName: string; shirtColor: string; userID: string } {
    return {
      teamName: this._teamName,
      shirtColor: this._shirtColor,
      userID: this._userID
    };
  }

  static fromApi(data: any): Team {
    return new Team(
      data.TeamUUID || data.id,
      data.TeamName,
      data.ShirtColor,
      data.UserID,
      data.UserName
    );
  }
}
