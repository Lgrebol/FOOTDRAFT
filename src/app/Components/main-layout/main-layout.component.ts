import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../Serveis/auth.service';
import { UserService } from '../../Serveis/user.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  footcoins: number = 0;
  private footcoinsSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.subscribeToFootcoins();
  }

  private loadUserData(): void {
    this.authService.refreshCurrentUserData().subscribe({
      next: (user) => {
        if (user) {
          this.userService.updateFootcoins(user.footcoins);
        }
      },
      error: () => this.redirectToLogin()
    });
  }

  private subscribeToFootcoins(): void {
    this.footcoinsSubscription = this.userService.getFootcoinsUpdates().subscribe(
      (coins) => this.footcoins = coins ?? 0
    );
  }

  logout(): void {
    this.authService.logoutUser();
    this.userService.logoutUser();
    this.redirectToLogin();
  }

  private redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.footcoinsSubscription?.unsubscribe();
  }
}