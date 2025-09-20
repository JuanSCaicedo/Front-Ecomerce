import { Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';

@Component({
  selector: 'app-filter-advance-product',
  standalone: true,
  imports: [],
  templateUrl: './filter-advance-product.component.html',
  styleUrl: './filter-advance-product.component.css'
})
export class FilterAdvanceProductComponent {
  categories: any = [];
  colors: any = [];
  brands: any = [];
  PRODUCTOS:any = [];

  constructor(
    public homeService: HomeService
  ) { 
    this.homeService.getConfigFilter().subscribe((resp:any) => {
      console.log(resp);
    });
  }
}
