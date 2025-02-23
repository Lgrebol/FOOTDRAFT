export class User {
  constructor(
    private _userUUID: string = '',
    private _username: string = '',
    private _email: string = '',
    private _footcoins: number = 0,
    private _password?: string,
    private _confirmPassword?: string
  ) {}

  // Getters i setters
  get userUUID(): string { return this._userUUID; }
  get username(): string { return this._username; }
  get email(): string { return this._email; }
  get footcoins(): number { return this._footcoins; }
  get password(): string | undefined { return this._password; }
  get confirmPassword(): string | undefined { return this._confirmPassword; }

  set userUUID(value: string) { this._userUUID = value; }
  set username(value: string) { this._username = value; }
  set email(value: string) { this._email = value; }
  set footcoins(value: number) { this._footcoins = value; }
  set password(value: string | undefined) { this._password = value; }
  set confirmPassword(value: string | undefined) { this._confirmPassword = value; }

  displayLabel(): string {
    return `${this._username} (${this._email})`;
  }

static fromApi(data: any): User {
  return new User(
    data.UserUUID,
    data.username || data.Email?.split('@')[0] || 'Usuari', 
    data.Email || 'Sense email',
    data.Footcoins
  );
}

  // Validació d'email bàsica
  isValidEmail(): boolean {
    return this._email.includes('@');
  }

  // Validació de la contrasenya: mínim 6 caràcters amb almenys 1 símbol
  isValidPassword(): boolean {
    const minLength = 6;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return !!this._password && this._password.length >= minLength && symbolRegex.test(this._password);
  }

  // Comprovació que la contrasenya coincideixi amb la confirmació (per registre)
  isPasswordMatch(): boolean {
    return this._password === this._confirmPassword;
  }

  // Validació per registre: nom d'usuari no buit, email vàlid, contrasenya vàlida i coincidència
  isValidForRegistration(): boolean {
    return this._username.trim() !== '' &&
           this.isValidEmail() &&
           this.isValidPassword() &&
           this.isPasswordMatch();
  }

  // Validació per login: email vàlid i contrasenya no buida
  isValidForLogin(): boolean {
    return this.isValidEmail() && !!this._password && this._password.trim() !== '';
  }

  // Actualitza les dades bàsiques de l'usuari (ex. després d'un registre o update)
  updateUserDetails(username: string, email: string): void {
    this._username = username;
    this._email = email;
  }

  // Actualitza els footcoins
  updateFootcoins(newAmount: number): void {
    this._footcoins = newAmount;
  }
}