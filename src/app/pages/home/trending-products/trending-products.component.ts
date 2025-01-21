import { Component, EventEmitter, Output, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

declare function MODAL_PRODUCT_DETAIL([]): any;
declare var $: any;

@Component({
  selector: 'app-trending-products',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './trending-products.component.html',
  styleUrl: './trending-products.component.css'
})
export class TrendingProductsComponent {

  @Output() productSelected = new EventEmitter<any>();
  @Input() TRENDING_PRODUCT_NEW: any[] = [];
  @Input() TRENDING_PRODUCT_FEATURED: any[] = [];
  @Input() TRENDING_PRODUCT_TOP_SELLER: any[] = [];
  @Input() VIEW_READY_TRENDING: boolean = false;
  @Input() TRENDING_STATE: boolean = false;
  @Input() MANTINANCE_STATUS: boolean = false;
  product_selected: any = null;
  currency: string = 'COP';

  constructor(
    public homeService: HomeService,
    public cookieService: CookieService
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

  OpenDetailProduct(product: any) {
    // Primero establecemos el producto a null
    this.productSelected.emit(null);

    // Usando setTimeout para dar un pequeño delay
    setTimeout(() => {
      // Emitimos el producto seleccionado
      this.productSelected.emit(product);
      // Abrimos el modal
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }
}