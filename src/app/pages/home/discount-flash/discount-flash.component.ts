import { Component } from '@angular/core';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-discount-flash',
  standalone: true,
  imports: [],
  templateUrl: './discount-flash.component.html',
  styleUrl: './discount-flash.component.css'
})

export class DiscountFlashComponent {

  DISCOUNT_FLASH: any;
  DISCOUNT_FLASH_PRODUCTS: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    this.homeService.discount_flash().subscribe((resp: any) => {
      console.log(resp);
      this.DISCOUNT_FLASH = resp.discount_flash;
      this.DISCOUNT_FLASH_PRODUCTS = resp.discount_flash_products;

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
}
