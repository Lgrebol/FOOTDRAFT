import { Component } from '@angular/core';
import { LoginRegisterComponent } from './FRONTEND/login-register/login-register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginRegisterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FOOTDRAFT';
}
