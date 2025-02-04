import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Assegura't d'importar CommonModule
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule], // Afegim CommonModule perquè NgFor i els pipes (com currency) estiguin disponibles
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('StoreComponent initialized');
  }
}