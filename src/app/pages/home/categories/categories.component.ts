import { Component, Input } from '@angular/core';
import { HomeService } from '../service/home.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {

  @Input() CATEGORIES_RANDOMS: any[] = [];  // Usamos @Input() para recibir los datos

  constructor(
    public homeService: HomeService,
  ) { }
}
