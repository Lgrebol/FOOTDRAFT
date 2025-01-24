import { Routes } from '@angular/router';
import { LoginRegisterComponent } from './FRONTEND/login-register/login-register.component';
import { DashboardComponent } from './FRONTEND/dashboard/dashboard.component';

export const appRoutes: Routes = [
  { path: '', component: LoginRegisterComponent },
  { path: 'dashboard', component: DashboardComponent }
];
