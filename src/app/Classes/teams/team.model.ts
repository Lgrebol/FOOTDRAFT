export class Team {
  constructor(
    private _id: number,
    private _teamName: string,
    private _shirtColor: string,
    private _userID: number,
    private _username?: string
  ) {}

  get id(): number {
    return this._id;
  }
  get teamName(): string {
    return this._teamName;
  }
  get shirtColor(): string {
    return this._shirtColor;
  }
  get userID(): number {
    return this._userID;
  }
  get username(): string | undefined {
    return this._username;
  }

  // Exemple: Mostrar informació bàsica de l'equip
  displayInfo(): string {
    return `${this._teamName} - ${this._shirtColor}`;
  }
}
