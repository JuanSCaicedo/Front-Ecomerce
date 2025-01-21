import { Component, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-last-products',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './last-products.component.html',
  styleUrl: './last-products.component.css'
})

export class LastProductsComponent {

  @Input() LAST_PRODUCT_DISCOUNTS: any[] = [];  // Usamos @Input() para recibir los datos
  @Input() LAST_PRODUCT_FEATURED: any[] = [];  // Usamos @Input() para recibir los datos
  @Input() LAST_PRODUCT_SELLING: any[] = [];  // Usamos @Input() para recibir los datos
  @Input() VIEW_READY_LAST_PRODUCTS: boolean = false;  // Usamos @Input() para recibir los datos
  @Input() LAST_PRODUCTS_STATE: boolean = false;  // Usamos @Input() para recibir los datos
  currency: string = 'COP';

  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
  ) { }

  ngAfterViewInit() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';
  }

  getNewTotal(PRODUCT: any, DISCOUNT_FLASH_P: any) {
    if (this.currency == 'COP') {
      if (DISCOUNT_FLASH_P.type_discount == 1) {
        return (PRODUCT.price_cop - PRODUCT.price_cop * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2);
      } else {
        return (PRODUCT.price_cop - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    } else {
      if (DISCOUNT_FLASH_P.type_discount == 1) {
        return (PRODUCT.price_usd - PRODUCT.price_usd * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2);
      } else {
        return (PRODUCT.price_usd - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }
  }

  getTotalPrice(product: any) {
    if (product.discount_g) {
      return this.getNewTotal(product, product.discount_g);
    }

    if (this.currency == 'COP') {
      return product.price_cop;
    } else {
      return product.price_usd;
    }
  }

  getTotalCurrency(PRODUCT: any) {
    if (this.currency == 'COP') {
      return PRODUCT.price_cop;
    } else {
      return PRODUCT.price_usd;
    }
  }
}
