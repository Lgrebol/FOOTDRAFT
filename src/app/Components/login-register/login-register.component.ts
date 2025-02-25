import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../Serveis/user.service';
import { User } from '../../Classes/user/user.model';

interface JwtPayload {
  userUUID: string;
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

  userModel: User = new User();

  errors = {
    usernameError: false,
    emailError: false,
    passwordError: false,
    confirmPasswordMismatchError: false,
    passwordRegexError: false
  };

  constructor(
    private router: Router,
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
    this.validateRegistrationForm();
    if (this.userModel.isValidForRegistration()) {
      this.registerUser();
    }
  }

  private validateRegistrationForm(): void {
    this.errors.usernameError = this.userModel.username.trim() === '';
    this.errors.emailError = !this.userModel.isValidEmail();
    this.errors.passwordError = !this.userModel.password || this.userModel.password.trim() === '';
    this.errors.confirmPasswordMismatchError = !this.userModel.isPasswordMatch();
    this.errors.passwordRegexError = !this.userModel.isValidPassword();
  }

  private registerUser(): void {
    this.userService.registerUser(this.userModel).subscribe({
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
    this.userModel = new User();
  }

  private switchToLogin(): void {
    this.container.nativeElement.classList.remove('sign-up-mode');
  }

  handleSignIn(): void {
    if (!this.userModel.isValidForLogin()) {
      alert('Si us plau, omple tots els camps correctament');
      return;
    }

    this.userService.loginUser(this.userModel).subscribe({
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
    localStorage.setItem('authToken', token);
    this.userService.refreshCurrentUserData().subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        console.error('Error actualitzant dades:', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }
}