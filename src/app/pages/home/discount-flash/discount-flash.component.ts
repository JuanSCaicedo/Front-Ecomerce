import { Component, EventEmitter, Output, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../service/cart.service';
import { ToastrService } from 'ngx-toastr';

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
  @Output() isFlash = new EventEmitter<boolean>();

  @Input() DISCOUNT_FLASH: any;  // Usamos @Input() para recibir los datos
  @Input() DISCOUNT_FLASH_PRODUCTS: any[] = [];  // Usamos @Input() para recibir los datos
  @Input() VIEW_READY_FLASH: boolean = false;
  @Input() DISCOUNT_FLASH_PRODUCTS_STATE: boolean = false;
  currency: string = 'COP';
  is_flash: boolean = true;

  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';
  }

  addCart(PRODUCT: any) {

    if (PRODUCT.variations.length == 0 && this.authService.tokenSubject.value) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    this.homeService.homeView().subscribe(); // Para actualizar la vista mntto de la página principal

    if (!this.authService.tokenSubject.value) {
      this.toastr.error("Validación", "Debes iniciar sesión para agregar productos al carrito");
      this.router.navigateByUrl("/login");
      return;
    }

    if (PRODUCT.variations.length > 0) {
      $("#producQuickViewModal").modal("show");
      this.OpenDetailProduct(PRODUCT);
      this.toastr.warning("Este producto tiene variaciones, por favor selecciona una variación antes de agregar al carrito", "Aviso");
      return;
    }

    let discount_g = null;
    let code_discount_v = null;

    if (PRODUCT.discount_g) {
      discount_g = PRODUCT.discount_g;
    }

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

    let subtotal_v = null;

    subtotal_v = this.getNewTotal(PRODUCT, PRODUCT.discount_g);

    let data = {
      product_id: PRODUCT.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaing: discount_g ? discount_g.type_campaing : null,
      code_cupon: null,
      code_discount: code_discount_v,
      product_variation_id: null,
      quantity: 1,
      price_unit: this.currency == 'COP' ? PRODUCT.price_cop : PRODUCT.price_usd,
      subtotal: subtotal_v,
      total: Number(subtotal_v) * 1,
      currency: this.currency,
    }

    this.authService.validarToken(this.authService.tokenSubject.value).subscribe((response: any) => {
      if (response) {
        this.cartService.registerCart(data).subscribe((resp: any) => {
          console.log(resp);

          if (resp.message == 403) {
            this.toastr.error(resp.message_text, "Validación");
          } else {
            this.cartService.changeCart(resp.cart);
            this.toastr.success("Éxito", "Producto agregado al carrito");
          }
        }, (error) => {
          console.log(error);
          this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
        });
      } else {
        this.cartService.clearCart();
        this.authService.tokenSubject.next(this.authService.tokenSubject.value); // Sincroniza el token
        this.toastr.error("Validación", "Debes iniciar sesión para agregar productos al carrito");
        this.router.navigateByUrl("/login");
        return;
      }
    });
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

  OpenDetailProduct(PRODUCT: any) {
    // Primero establecemos el producto a null
    this.productSelected.emit(null);

    // Usando setTimeout para dar un pequeño delay
    setTimeout(() => {
      // Emitimos el producto seleccionado
      this.productSelected.emit(PRODUCT);
      this.isFlash.emit(true);
    }, 50);
  }

  getTotalCurrency(PRODUCT: any) {
    if (this.currency == 'COP') {
      return PRODUCT.price_cop;
    } else {
      return PRODUCT.price_usd;
    }
  }
}
