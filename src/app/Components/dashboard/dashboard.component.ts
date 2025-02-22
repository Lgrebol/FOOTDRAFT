import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../Serveis/dashboard.service';
import { DashboardStats } from '../../Classes/dashboard/dashboard-stats.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  dashboardStats!: DashboardStats;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
      },
      error: (error) => console.error('Error loading dashboard stats:', error)
    });
  }
}