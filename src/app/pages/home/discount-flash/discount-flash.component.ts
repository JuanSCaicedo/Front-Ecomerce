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
}
