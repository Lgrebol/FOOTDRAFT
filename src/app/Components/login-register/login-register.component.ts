import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../Serveis/auth.service';
import { UserService } from '../../Serveis/user.service';

interface LoginResponse {
  token: string;
}

interface JwtPayload {
  userId: number;
  email: string;
  footcoins?: number;
}

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
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

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngAfterViewInit(): void {
    this.initViewTransition();
  }

  private initViewTransition(): void {
    if (this.signUpBtn?.nativeElement && this.container?.nativeElement) {
      this.signUpBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.add('sign-up-mode');
      });
    }

    if (this.signInBtn?.nativeElement && this.container?.nativeElement) {
      this.signInBtn.nativeElement.addEventListener('click', () => {
        this.container.nativeElement.classList.remove('sign-up-mode');
      });
    }
  }

  onSubmit(): void {
    this.validateForm();
    
    if (this.isFormValid()) {
      this.registerUser();
    }
  }

  private validateForm(): void {
    this.usernameError = !this.username;
    this.emailError = !this.email;
    this.passwordError = !this.password;
    this.confirmPasswordMismatchError = !this.passwordMatchValidator();
    this.passwordRegexError = !this.passwordValidator();
  }

  private isFormValid(): boolean {
    return !!this.username && !!this.email && !!this.password && 
           this.passwordMatchValidator() && this.passwordValidator();
  }

  private registerUser(): void {
    this.userService.registerUser(this.username, this.email, this.password).subscribe({
      next: () => {
        alert('Registre exitós! Inicieu sessió');
        this.clearForm();
        this.switchToLogin();
      },
      error: (error) => {
        console.error('Error durant el registre', error);
        alert(error.error?.error || 'Error en el registre');
      }
    });
  }

  private clearForm(): void {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  private switchToLogin(): void {
    this.container.nativeElement.classList.remove('sign-up-mode');
  }

  passwordMatchValidator(): boolean {
    return this.password === this.confirmPassword;
  }

  passwordValidator(): boolean {
    const minLength = 6;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return this.password.length >= minLength && symbolRegex.test(this.password);
  }

  handleSignIn(): void {
    if (!this.email || !this.password) {
      alert('Si us plau, omple tots els camps');
      return;
    }

    this.authService.loginUser(this.email, this.password).subscribe({
      next: (response) => {
        if (response.token) {
          this.handleSuccessfulLogin(response.token);
        }
      },
      error: (error) => {
        console.error("Error d'inici de sessió:", error);
        alert(error.error?.error || 'Credencials incorrectes');
      }
    });
  }

  private handleSuccessfulLogin(token: string): void {
    const decodedToken = jwtDecode<JwtPayload>(token);
    
    localStorage.setItem('authToken', token);
    
    this.authService.refreshCurrentUserData().subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        console.error('Error actualitzant dades:', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }
}