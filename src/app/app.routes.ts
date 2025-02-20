import { Routes } from '@angular/router';
import { LoginRegisterComponent } from './Components/login-register/login-register.component';
import { MainLayoutComponent } from './Components/main-layout/main-layout.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { PlayersComponent } from './Components/players/players.component';
import { TeamsComponent } from './Components/teams/teams.component';
import { TournamentComponent } from './Components/tournament/tournament.component';
import { MatchComponent } from './Components/match/match.component';
import { StoreComponent } from './Components/store/store.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginRegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'players', component: PlayersComponent },
      { path: 'teams', component: TeamsComponent },
      { path: 'tournaments', component: TournamentComponent },
      { path: 'match', component: MatchComponent },
      { path: 'store', component: StoreComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];