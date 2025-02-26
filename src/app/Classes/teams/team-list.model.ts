import { Team } from './team.model';

export class TeamList {
  private _teams: Team[] = [];

  get teams(): Team[] {
    return this._teams;
  }

  set teams(teams: Team[]) {
    this._teams = teams;
  }
}
