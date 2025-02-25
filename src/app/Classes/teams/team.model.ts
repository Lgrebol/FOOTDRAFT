export class Team {
  constructor(
    private _teamUUID: string = '',
    private _teamName: string = '',
    private _shirtColor: string = '',
    private _userUUID: string = '',
    private _username?: string
  ) {}

  // Getters
  get teamUUID(): string {
    return this._teamUUID;
  }
  get teamName(): string {
    return this._teamName;
  }
  get shirtColor(): string {
    return this._shirtColor;
  }
  get userUUID(): string {
    return this._userUUID;
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
  set userUUID(value: string) {
    this._userUUID = value;
  }
  set username(value: string | undefined) {
    this._username = value;
  }

  displayInfo(): string {
    return `${this._teamName} - ${this._shirtColor}`;
  }

  toPayload(): { 
    teamName: string; 
    shirtColor: string; 
    userID: string  // Map correcte del camp userUUID
  } {
    return {
      teamName: this._teamName,
      shirtColor: this._shirtColor,
      userID: this._userUUID
    };
  }

  static fromApi(data: any): Team {
    return new Team(
      data.TeamUUID || data.teamUUID,
      data.TeamName || data.teamName,
      data.ShirtColor || data.shirtColor,
      data.UserUUID || data.userUUID || data.UserID,
      data.UserName || data.username
    );
  }
}
