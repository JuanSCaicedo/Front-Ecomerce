import { Component, afterRender } from '@angular/core';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

declare var $: any;
declare function PRODUCTS_CARUSEL_HOME([]): any;

@Component({
  selector: 'app-carusel-products',
  standalone: true,
  imports: [],
  templateUrl: './carusel-products.component.html',
  styleUrl: './carusel-products.component.css'
})

export class CaruselProductsComponent {

  PRODUCTS_CARUSEL: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    this.homeService.products_carusel().subscribe((resp: any) => {
      console.log(resp);
      this.PRODUCTS_CARUSEL = resp.product_carusel.data;
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });

    afterRender(() => {
      setTimeout(() => {
        PRODUCTS_CARUSEL_HOME($);
      }, 50);
    })
  }
}
