import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginRegisterComponent } from './FRONTEND/login-register/login-register.component';
import { DashboardComponent } from './FRONTEND/dashboard/dashboard.component';
import { PlayersComponent } from './FRONTEND/players/players.component';
import { TeamsComponent } from './FRONTEND/teams/teams.component';
import { CommonModule } from '@angular/common';
@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    LoginRegisterComponent,
    DashboardComponent,
    PlayersComponent,
    TeamsComponent 
  ],  
  bootstrap: [AppComponent]
})
export class AppConfig {}