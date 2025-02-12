import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: any;
  private apiUrl = 'http://localhost:3000/api/v1/dashboard';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any>(this.apiUrl).subscribe(
      data => this.stats = data,
      error => console.error('Error carregant estadístiques del dashboard:', error)
    );
  }
}
