import { Component } from '@angular/core';
import { HomeService } from './service/home.service';
import { ToastrService } from 'ngx-toastr';
import { SliderComponent } from './slider/slider.component';
import { CategoriesComponent } from './categories/categories.component';
import { TrendingProductsComponent } from './trending-products/trending-products.component';
import { SliderSecundarioComponent } from './slider-secundario/slider-secundario.component';
import { ElectronicProductsComponent } from './electronic-products/electronic-products.component';
import { CaruselProductsComponent } from './carusel-products/carusel-products.component';
import { SliderProductsComponent } from './slider-products/slider-products.component';
import { LastProductsComponent } from './last-products/last-products.component';
import { DiscountFlashComponent } from './discount-flash/discount-flash.component';
import { ModalProductoComponent } from './modal-producto/modal-producto.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SliderComponent,
    CategoriesComponent,
    TrendingProductsComponent,
    SliderSecundarioComponent,
    ElectronicProductsComponent,
    CaruselProductsComponent,
    SliderProductsComponent,
    LastProductsComponent,
    DiscountFlashComponent,
    ModalProductoComponent],
    
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  product_selected: any = null;

  handleProductSelect(product: any) {
    this.product_selected = product;
  }
}