export class User {
  constructor(
    private _id: number,
    private _username: string,
    private _email: string,
    private _footcoins: number
  ) {}

  get id(): number {
    return this._id;
  }
  get username(): string {
    return this._username;
  }
  get email(): string {
    return this._email;
  }
  get footcoins(): number {
    return this._footcoins;
  }

  // Exemple: Actualitzar les footcoins de l'usuari
  updateFootcoins(newAmount: number): void {
    this._footcoins = newAmount;
  }
}
