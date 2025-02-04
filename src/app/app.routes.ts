import { Routes } from '@angular/router';
import { LoginRegisterComponent } from './FRONTEND/login-register/login-register.component';
import { MainLayoutComponent } from './FRONTEND/main-layout/main-layout.component';
import { DashboardComponent } from './FRONTEND/dashboard/dashboard.component';
import { PlayersComponent } from './FRONTEND/players/players.component';
import { TeamsComponent } from './FRONTEND/teams/teams.component';
import { TournamentComponent } from './FRONTEND/tournament/tournament.component';
import { MatchComponent } from './FRONTEND/match/match.component';
import { StoreComponent } from './FRONTEND/store/store.component';
export const appRoutes: Routes = [
  { path: '', component: LoginRegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'players', component: PlayersComponent },
      { path: 'teams', component: TeamsComponent },
      { path: 'tournaments', component: TournamentComponent },
      { path: 'match', component: MatchComponent },
      { path:'store', component: StoreComponent }
    ]
  }
];
