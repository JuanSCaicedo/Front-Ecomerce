import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
declare function MODAL_PRODUCT_DETAIL([]): any;
declare function COUNTER([]): any;
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
  @Input() is_flash: boolean = false;

  filtered_images: any[] = []; // Lista de imágenes aleatorias
  variation_selected: any = null; // Lista de subvariaciones
  currency: string = 'COP';
  sub_variation_selected: any; // Subvariación seleccionada

  constructor(
    private homeService: HomeService,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private toastr: ToastrService,
    public cookieService: CookieService,
  ) { }

  ngOnInit() {
    this.homeService.homeView().subscribe();

    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';

    console.log(this.product_selected);
    if (this.product_selected?.images) {
      this.filtered_images = this.getRandomImages(this.product_selected.images, 3);
    }

    setTimeout(() => {
      MODAL_PRODUCT_DETAIL($);
      COUNTER($);
    }, 50);
  }

  // Método para obtener N elementos aleatorios
  getRandomImages(images: any[], count: number): any[] {
    return [...images]
      .sort(() => Math.random() - 0.5) // Baraja las imágenes
      .slice(0, count); // Obtiene los primeros 'count' elementos
  }

  getNewTotal(PRODUCT: any, DISCOUNT_FLASH_P: any) {
    if (this.currency == 'COP') {
      if (DISCOUNT_FLASH_P.type_discount == 1) {//% DE DESCUENT0 50
        // 100 / 100*(50*0.01) 100*0.5=50
        return ((PRODUCT.price_cop) - (PRODUCT.price_cop) * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2)
      } else {//-PEN/-USD 
        return ((PRODUCT.price_cop) - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    } else {
      if (DISCOUNT_FLASH_P.type_discount == 1) {//% DE DESCUENT0 50
        // 100 / 100*(50*0.01) 100*0.5=50
        return ((PRODUCT.price_usd) - (PRODUCT.price_usd) * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2)
      } else {//-PEN/-USD 
        return ((PRODUCT.price_usd) - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }
  }

  getTotalPriceProduct(PRODUCT: any) {
    if (PRODUCT.discount_g && PRODUCT.discount_g.type_campaing != 2) {
      return this.getNewTotal(PRODUCT, PRODUCT.discount_g);
    }
    if (this.currency == 'COP') {
      return PRODUCT.price_cop;
    } else {
      return PRODUCT.price_usd;
    }
  }

  getTotalPriceProductFlash(PRODUCT: any) {
    if (PRODUCT.discount_g) {
      return this.getNewTotal(PRODUCT, PRODUCT.discount_g);
    }
    if (this.currency == 'COP') {
      return PRODUCT.price_cop;
    } else {
      return PRODUCT.price_usd;
    }
  }

  getTotalCurrency(PRODUCT: any) {
    if (this.currency == 'COP') {
      return PRODUCT.price_cop;
    } else {
      return PRODUCT.price_usd;
    }
  }

  selectedVariation(variation: any) {
    this.variation_selected = null;
    this.sub_variation_selected = null;

    setTimeout(() => {
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  selectedSubVariation(subvariation: any) {
    this.sub_variation_selected = null;

    setTimeout(() => {
      this.sub_variation_selected = subvariation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  addCart() {
    this.homeService.homeView().subscribe(); // Para actualizar la vista mntto de la página principal

    if (!this.authService.tokenSubject.value) {
      this.toastr.error("Validación", "Debes iniciar sesión para agregar productos al carrito");
      this.router.navigateByUrl("/login");

      $("#producQuickViewModal").modal("hide"); // Oculta el modal
      return;
    }

    if (this.product_selected.variations.length > 0) {
      if (!this.variation_selected) {
        this.toastr.error("Validación", "Debes seleccionar una variación");
        return;
      }

      if (this.variation_selected && this.variation_selected.subvariations.length > 0) {
        if (!this.sub_variation_selected) {
          this.toastr.error("Validación", "Debes seleccionar una sub-variación");
          return;
        }
      }
    }

    let product_variation_id = null;

    if (this.product_selected.variations.length > 0 && this.variation_selected.subvariations.length == 0 && this.variation_selected) {
      product_variation_id = this.variation_selected.id;
    }

    if (this.product_selected.variations.length > 0 && this.variation_selected.subvariations.length > 0 && this.variation_selected) {
      product_variation_id = this.sub_variation_selected.id;
    }

    let discount_g = null;

    if (this.product_selected.discount_g) {
      discount_g = this.product_selected.discount_g;
    }

    let subtotal_v = null;
    let code_discount_v = null;

    // Primera validación para subtotal
    if (discount_g) {
      if (discount_g.type_campaing == 2 && this.is_flash) {
        subtotal_v = this.getTotalPriceProductFlash(this.product_selected);
      } else {
        subtotal_v = this.getTotalPriceProduct(this.product_selected);
      }
    } else {
      subtotal_v = this.getTotalPriceProduct(this.product_selected);
    }

    // Segunda validación para code_discount
    if (discount_g) {
      if (discount_g.type_campaing == 2 && this.is_flash) {
        code_discount_v = discount_g.code;
      } else if (discount_g.type_campaing == 1) {
        code_discount_v = discount_g.code;
      } else {
        code_discount_v = null;
      }
    } else {
      code_discount_v = null;
    }

    let data = {
      product_id: this.product_selected.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaing: discount_g ? discount_g.type_campaing : null,
      code_cupon: null,
      code_discount: code_discount_v,
      product_variation_id: product_variation_id,
      quantity: $("#tp-cart-input-val").val(),
      price_unit: this.product_selected.price_cop,
      subtotal: subtotal_v,
      total: subtotal_v * $("#tp-cart-input-val").val(),
      currency: this.currency,
    }

    this.cartService.registerCart(data).subscribe((resp: any) => {
      console.log(resp);

      if (resp.message == 403) {
        this.toastr.error("Validación", resp.message_text);
      } else {
        this.cartService.changeCart(resp.cart);
        this.toastr.success("Éxito", "Producto agregado al carrito");
      }
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
  }
}