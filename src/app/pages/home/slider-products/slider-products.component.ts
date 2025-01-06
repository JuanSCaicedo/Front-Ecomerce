import { Component, Input } from '@angular/core';
import { HomeService } from '../service/home.service';

@Component({
  selector: 'app-slider-products',
  standalone: true,
  imports: [],
  templateUrl: './slider-products.component.html',
  styleUrl: './slider-products.component.css'
})
export class SliderProductsComponent {

  @Input() SLIDERS_PRODUCTS: any[] = [];  // Usamos @Input() para recibir los datos

  constructor(
    public homeService: HomeService,
  ) { }
}
