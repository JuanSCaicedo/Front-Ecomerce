import { Component, EventEmitter, Output, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  @Input() VIEW_READY: boolean = false;
  product_selected: any = null;

  constructor(
    public homeService: HomeService,
  ) { }

  getNewTotal(PRODUCT: any, DISCOUNT_FLASH_P: any) {
    if (DISCOUNT_FLASH_P.type_discount == 1) {
      return (PRODUCT.price_cop - PRODUCT.price_cop * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2);
    } else {
      return (PRODUCT.price_cop - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
  }

  getTotalPrice(product: any) {
    if (product.discount_g) {
      return this.getNewTotal(product, product.discount_g);
    }
    return product.price_cop;
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