import { Component, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {

  @Input() CATEGORIES_RANDOMS: any[] = [];  // Usamos @Input() para recibir los datos
  @Input() VIEW_READY_CATEGORIES_RAMDOMS: boolean = false;
  @Input() CATEGORIES_STATE: boolean = false;
  @Input() MANTINANCE_STATUS: boolean = false;

  constructor(
    public homeService: HomeService,
  ) { }
}
