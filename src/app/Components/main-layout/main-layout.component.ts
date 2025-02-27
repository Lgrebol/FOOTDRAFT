import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
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
  menuOpen: boolean = false;
  private footcoinsSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.subscribeToFootcoins();
    this.userService.getFootcoinsUpdates().subscribe({
      next: (footcoins) => {
      },
      error: (err) => {
        console.error('Error obtenint footcoins:', err);
      }
    });
  }

  private loadUserData(): void {
    this.userService.refreshCurrentUserData().subscribe({
      next: (user) => {
        if (user) {
          this.userService.updateFootcoins(user.footcoins);
        }
      },
      error: () => this.redirectToLogin()
    });
  }

  private subscribeToFootcoins(): void {
    this.footcoinsSubscription = this.userService.getFootcoinsUpdates().subscribe({
      next: (coins) => this.footcoins = coins ?? 0,
      error: (err) => console.error('Error updating footcoins:', err)
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
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