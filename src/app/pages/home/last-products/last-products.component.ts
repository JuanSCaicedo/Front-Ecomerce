import { Component } from '@angular/core';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-last-products',
  standalone: true,
  imports: [],
  templateUrl: './last-products.component.html',
  styleUrl: './last-products.component.css'
})

export class LastProductsComponent {

  LAST_PRODUCT_DISCOUNTS: any = [];
  LAST_PRODUCT_FEATURED: any = [];
  LAST_PRODUCT_SELLING: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    this.homeService.last_products().subscribe((resp: any) => {
      console.log(resp);
      this.LAST_PRODUCT_DISCOUNTS = resp.product_last_discounts.data;
      this.LAST_PRODUCT_FEATURED = resp.product_last_featured.data;
      this.LAST_PRODUCT_SELLING = resp.product_last_selling.data;

    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
  }

  getNewTotal(PRODUCT: any, DISCOUNT_FLASH_P: any) {
    if (DISCOUNT_FLASH_P.type_discount == 1) {
      return (PRODUCT.price_cop - PRODUCT.price_cop * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2);
    } else {
      return (PRODUCT.price_cop - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
  }

  getTotalPrice(PRODUCT: any) {
    if (PRODUCT.discount_g) {
      return this.getNewTotal(PRODUCT, PRODUCT.discount_g);
    }
    return PRODUCT.price_cop;
  }
}
