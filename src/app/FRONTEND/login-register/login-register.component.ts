import { CommonModule, NgIf } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistreService } from '../services/registre.service';
import { UserService } from '../services/users.service'; // Importa el UserService

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule],
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css']
})
export class LoginRegisterComponent implements AfterViewInit {
  @ViewChild('signInBtn') signInBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('signUpBtn') signUpBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('container') container!: ElementRef<HTMLElement>;

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  usernameError: boolean = false;
  emailError: boolean = false;
  passwordError: boolean = false;
  confirmPasswordMismatchError: boolean = false;
  passwordRegexError: boolean = false;

  user: any = null;
  loggedIn: boolean = false;

  constructor(
    private router: Router,
    private registreService: RegistreService,
    private userService: UserService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.signUpBtn && this.container) {
      this.signUpBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.add('sign-up-mode');
      });
    }

    if (this.signInBtn && this.container) {
      this.signInBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.remove('sign-up-mode');
      });
    }
  }

  onSubmit() {
    this.usernameError = false;
    this.emailError = false;
    this.passwordError = false;
    this.confirmPasswordMismatchError = false;
    this.passwordRegexError = false;

    let formValid = true;

    if (!this.username) {
      this.usernameError = true;
      formValid = false;
    }

    if (!this.email) {
      this.emailError = true;
      formValid = false;
    }

    if (!this.password) {
      this.passwordError = true;
      formValid = false;
    } else if (!this.passwordValidator()) {
      this.passwordRegexError = true;
      formValid = false;
    }

    if (!this.confirmPassword) {
      this.passwordError = true;
      formValid = false;
    }

    if (!this.passwordMatchValidator()) {
      this.confirmPasswordMismatchError = true;
      formValid = false;
    }

    if (formValid) {
      console.log('Dades enviades:', {
        username: this.username,
        email: this.email,
        password: this.password,
      });

      this.registreService.register(this.username, this.email, this.password).subscribe(
        (response) => {
          console.log('Registre correcte', response);
        },
        (error) => {
          console.error('Error en el registre', error);
        }
      );
      this.clearInputs();
    }
  }

  clearInputs() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  passwordMatchValidator() {
    return this.password === this.confirmPassword;
  }

  passwordValidator() {
    const minLength = 6;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;

    return this.password.length >= minLength && symbolRegex.test(this.password);
  }

  handleSignIn() {
    if (!this.email || !this.password) {
      console.error('Email i contrasenya requerits');
      return;
    }
  
    this.registreService.validateUser(this.email, this.password).subscribe({
      next: (response) => {
        if (response?.token) {
          console.log('✅ Token rebut al login:', response.token);
          // Guarda el token amb la clau 'authToken' (no amb 'token')
          localStorage.setItem('authToken', response.token);
          
          // Actualitza les dades de l'usuari abans de navegar
          this.userService.refreshUserData().subscribe({
            next: () => {
              console.log('Dades de l\'usuari actualitzades');
              this.router.navigate(['/dashboard']);
            },
            error: (err) => {
              console.error('Error actualitzant dades:', err);
              this.router.navigate(['/dashboard']);
            }
          });
        } else {
          console.error('❌ Resposta invàlida del servidor');
        }
      },
      error: (error) => {
        console.error("❌ Error al verificar l'usuari:", error);
        alert('Credencials incorrectes!');
      }
    });
  }
}