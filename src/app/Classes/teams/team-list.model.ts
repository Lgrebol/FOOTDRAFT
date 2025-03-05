import { Team } from './team.model';

export class TeamList {
  private _teams: Team[] = [];

  constructor() {}

  get teams(): Team[] {
    return this._teams;
  }

  set teams(teams: Team[]) {
    this._teams = teams;
  }

  add(team: Team): void {
    this._teams = [...this._teams, team];
  }

  remove(teamUUID: string): void {
    this._teams = this._teams.filter(team => team.teamUUID !== teamUUID);
  }
}