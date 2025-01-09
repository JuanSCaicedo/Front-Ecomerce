import { Component, afterRender } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ModalProductoComponent } from '../../home/modal-producto/modal-producto.component';

declare function MODAL_PRODUCT_DETAIL([]): any;
declare function LADING_PRODUCT([]): any;
declare var $: any;

@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalProductoComponent],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})

export class LandingProductComponent {
  PRODUCT_SLUG: any;
  PRODUCT_SELECTED: any;
  filtered_images: any = []; // Lista de imágenes aleatorias
  variation_selected: any;
  PRODUCT_RELATEDS: any = [];
  product_selected_modal: any;

  constructor(
    public homeService: HomeService,
    public activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.activatedRoute.params.subscribe((resp: any) => {
      this.PRODUCT_SLUG = resp.slug;
    }, (err: any) => {
      console.log(err);
      this.toastr.error('API Response - Comuniquese con el desarrollador', err.error.message || err.error.error || err.message);
    });

    this.homeService.showProduct(this.PRODUCT_SLUG).subscribe((resp: any) => {
      console.log(resp);

      if (resp.message == 403) {
        this.router.navigateByUrl("/error/404");
        this.toastr.error("Validación", resp.message_text);
      } else {
        this.PRODUCT_SELECTED = resp.product;
        this.PRODUCT_RELATEDS = resp.product_relateds.data;
      }

      setTimeout(() => {
        MODAL_PRODUCT_DETAIL($);
        LADING_PRODUCT($);
      }, 50);

    }, (err: any) => {
      console.log(err);
      this.toastr.error('API Response - Comuniquese con el desarrollador', err.error.message || err.error.error || err.message);
    });
  }

  ngOnInit() {
    if (this.PRODUCT_SELECTED?.images) {
      this.filtered_images = this.getRandomImages(this.PRODUCT_SELECTED.images, 4);
    }
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

  OpenDetailProduct(PRODUCT: any) {
    // Primero establecemos el producto a null
    this.product_selected_modal = null;

    // Usando setTimeout para dar un pequeño delay
    setTimeout(() => {
      // Emitimos el producto seleccionado
      this.product_selected_modal = PRODUCT;
    }, 50);
  }
}
