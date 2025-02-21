export class LoginRegister {
  constructor(
    private _email: string,
    private _password: string,
    private _username?: string
  ) {}

  get email(): string {
    return this._email;
  }
  get password(): string {
    return this._password;
  }
  get username(): string | undefined {
    return this._username;
  }

  // Exemple: Validar dades d'entrada
  isValid(): boolean {
    return this._email.includes('@') && this._password.length > 0;
  }
}
