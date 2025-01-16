import { Component, EventEmitter, Output, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

declare function MODAL_PRODUCT_DETAIL([]): any;
declare var $: any;

@Component({
  selector: 'app-discount-flash',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './discount-flash.component.html',
  styleUrl: './discount-flash.component.css'
})

export class DiscountFlashComponent {

  @Output() productSelected = new EventEmitter<any>();

  @Input() DISCOUNT_FLASH: any;  // Usamos @Input() para recibir los datos
  @Input() DISCOUNT_FLASH_PRODUCTS: any[] = [];  // Usamos @Input() para recibir los datos
  @Input() VIEW_READY_FLASH: boolean = false;
  @Input() DISCOUNT_FLASH_PRODUCTS_STATE: boolean = false;

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

  OpenDetailProduct(PRODUCT: any) {
    // Primero establecemos el producto a null
    this.productSelected.emit(null);

    // Usando setTimeout para dar un pequeño delay
    setTimeout(() => {
      // Emitimos el producto seleccionado
      this.productSelected.emit(PRODUCT);
      // Abrimos el modal
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }
}
