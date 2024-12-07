import { Component } from '@angular/core';
import { HomeService } from './service/home.service';
import { ToastrService } from 'ngx-toastr';
import { SliderComponent } from './slider/slider.component';
import { CategoriesComponent } from './categories/categories.component';
import { TrendingProductsComponent } from './trending-products/trending-products.component';
import { SliderSecundarioComponent } from './slider-secundario/slider-secundario.component';
import { ElectronicProductsComponent } from './electronic-products/electronic-products.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SliderComponent,
    CategoriesComponent,
    TrendingProductsComponent,
    SliderSecundarioComponent,
    ElectronicProductsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    private toastr: ToastrService,
    public homeService: HomeService,
  ) {

  }
}