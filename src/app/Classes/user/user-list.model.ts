import { User } from './user.model';

export class UserList {
  private _users: User[] = [];

  constructor(users?: User[]) {
    if (users) {
      this._users = users;
    }
  }

  get users(): User[] {
    return this._users;
  }

  set users(users: User[]) {
    this._users = users;
  }

  add(user: User): void {
    this._users = [...this._users, user];
  }

  remove(userUUID: string): void {
    this._users = this._users.filter(u => u.userUUID !== userUUID);
  }

  findById(userUUID: string): User | undefined {
    return this._users.find(u => u.userUUID === userUUID);
  }
}
