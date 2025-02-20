import { Component, OnInit } from '@angular/core';
import { DataService, DashboardStats } from '../shared/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getDashboardStats().subscribe(
      (data) => this.stats = data,
      (error) => console.error('Error loading dashboard stats:', error)
    );
  }
}
