import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../Serveis/dashboard.service';
import { DashboardStats } from '../../Classes/dashboard/dashboard-stats.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => console.error('Error loading dashboard stats:', error)
    });
  }
}