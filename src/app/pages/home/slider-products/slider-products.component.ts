import { Component, afterRender } from '@angular/core';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

declare var $: any;
declare function PRODUCTS_CARUSEL_HOME([]): any;

@Component({
  selector: 'app-slider-products',
  standalone: true,
  imports: [],
  templateUrl: './slider-products.component.html',
  styleUrl: './slider-products.component.css'
})
export class SliderProductsComponent {

  SLIDERS_PRODUCTS: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    this.homeService.slider_products().subscribe((resp: any) => {
      console.log(resp);
      this.SLIDERS_PRODUCTS = resp.sliders_products;
    }, (error) => {
      console.error(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });

    afterRender(() => {
      setTimeout(() => {
        PRODUCTS_CARUSEL_HOME($);
      }, 50);
    })
  }
}
