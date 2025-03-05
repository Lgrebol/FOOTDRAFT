export class Team {
  private _teamUUID: string = '';
  private _teamName: string = '';
  private _shirtColor: string = '';
  private _userUUID: string = '';
  private _username?: string = '';

  constructor() {}

  get teamUUID(): string { 
    return this._teamUUID; 
  }
  set teamUUID(value: string) { 
    this._teamUUID = value; 
  }

  get teamName(): string { 
    return this._teamName; 
  }
  set teamName(value: string) { 
    this._teamName = value; 
  }

  get shirtColor(): string { 
    return this._shirtColor; 
  }
  set shirtColor(value: string) { 
    this._shirtColor = value; 
  }

  get userUUID(): string { 
    return this._userUUID; 
  }
  set userUUID(value: string) { 
    this._userUUID = value; 
  }

  get username(): string | undefined { 
    return this._username; 
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
      userID: this._userUUID 
    };
  }

  static fromApi(data: { 
    TeamUUID?: string; 
    teamUUID?: string; 
    TeamName?: string; 
    teamName?: string; 
    ShirtColor?: string; 
    shirtColor?: string; 
    UserUUID?: string; 
    userUUID?: string; 
    UserID?: string; 
    UserName?: string; 
    username?: string 
  }): Team {
    const team = new Team();
    team.teamUUID = data.TeamUUID || data.teamUUID || '';
    team.teamName = data.TeamName || data.teamName || '';
    team.shirtColor = data.ShirtColor || data.shirtColor || '';
    team.userUUID = data.UserUUID || data.userUUID || data.UserID || '';
    team.username = data.UserName || data.username;
    return team;
  }
}
