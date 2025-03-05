import { IUserApiResponse } from '../../Interfaces/user-api-response.interface';

export class User {
  private _userUUID: string = '';
  private _username: string = '';
  private _email: string = '';
  private _footcoins: number = 0;
  private _password?: string = '';
  private _confirmPassword?: string = '';

  constructor() {}

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

  displayLabel(): string { return `${this._username} (${this._email})`; }

  static fromApi(data: IUserApiResponse): User {
    const user = new User();
    user._userUUID = data.UserUUID || data.userUUID || '';
    // Utilitzem l'operador opcional per evitar errors si no existeix Email o email
    user._username = data.username || data.name || ((data.Email || data.email)?.split('@')[0] || 'Usuari');
    user._email = data.Email || data.email || 'Sense email';
    user._footcoins = data.Footcoins ?? data.footcoins ?? 0;
    return user;
  }

  isValidEmail(): boolean { return this._email.includes('@'); }

  isValidPassword(): boolean {
    const minLength = 6;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return !!this._password && this._password.length >= minLength && symbolRegex.test(this._password);
  }

  isPasswordMatch(): boolean { return this._password === this._confirmPassword; }

  isValidForRegistration(): boolean {
    return this._username.trim() !== '' && this.isValidEmail() && this.isValidPassword() && this.isPasswordMatch();
  }

  isValidForLogin(): boolean {
    return this.isValidEmail() && !!this._password && this._password.trim() !== '';
  }

  updateUserDetails(username: string, email: string): void {
    this._username = username;
    this._email = email;
  }

  updateFootcoins(newAmount: number): void { this._footcoins = newAmount; }
}
