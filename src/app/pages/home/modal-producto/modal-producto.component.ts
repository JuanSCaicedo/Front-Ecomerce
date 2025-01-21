import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HomeService } from '../service/home.service';

declare function MODAL_PRODUCT_DETAIL([]): any;
declare var $: any;

@Component({
  selector: 'app-modal-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-producto.component.html',
  styleUrl: './modal-producto.component.css'
})
export class ModalProductoComponent {

  @Input() product_selected: any = null;

  filtered_images: any[] = []; // Lista de imágenes aleatorias
  variation_selected: any = null; // Lista de subvariaciones

  constructor(private homeService: HomeService) { }

  ngOnInit() {
    this.homeService.homeView().subscribe();

    console.log(this.product_selected);
    if (this.product_selected?.images) {
      this.filtered_images = this.getRandomImages(this.product_selected.images, 3);
    }

    setTimeout(() => {
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  // Método para obtener N elementos aleatorios
  getRandomImages(images: any[], count: number): any[] {
    return [...images]
      .sort(() => Math.random() - 0.5) // Baraja las imágenes
      .slice(0, count); // Obtiene los primeros 'count' elementos
  }

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

  selectedVariation(variation: any) {
    this.variation_selected = null;

    setTimeout(() => {
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }
}
