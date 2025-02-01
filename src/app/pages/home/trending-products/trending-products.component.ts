import { Component, EventEmitter, Output, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/service/auth.service';

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
  @Output() isFlash = new EventEmitter<boolean>();
  @Input() TRENDING_PRODUCT_NEW: any[] = [];
  @Input() TRENDING_PRODUCT_FEATURED: any[] = [];
  @Input() TRENDING_PRODUCT_TOP_SELLER: any[] = [];
  @Input() VIEW_READY_TRENDING: boolean = false;
  @Input() TRENDING_STATE: boolean = false;
  product_selected: any = null;
  currency: string = 'COP';
  is_flash: boolean = false;

  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    public cartService: CartService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
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
    let type_campaing_v = null;
    let type_discount_v = null;
    let discount_v = null;

    if (PRODUCT.discount_g) {
      discount_g = PRODUCT.discount_g;
    }

    if (discount_g) {
      if (discount_g.type_campaing == 2 && this.is_flash) {
        code_discount_v = discount_g.code;
        type_campaing_v = discount_g.type_campaing;
        discount_v = discount_g.discount;
        type_discount_v = discount_g.type_discount;
      } else if (discount_g.type_campaing == 1) {
        code_discount_v = discount_g.code;
        type_campaing_v = discount_g.type_campaing;
        discount_v = discount_g.discount;
        type_discount_v = discount_g.type_discount;
      } else {
        code_discount_v = null;
        type_campaing_v = null;
        discount_v = null;
        type_discount_v = null;
      }
    } else {
      code_discount_v = null;
      type_campaing_v = null;
      discount_v = null;
      type_discount_v = null;
    }

    let data = {
      product_id: PRODUCT.id,
      type_discount: type_discount_v,
      discount: discount_v,
      type_campaing: type_campaing_v,
      code_cupon: null,
      code_discount: code_discount_v,
      product_variation_id: null,
      quantity: 1,
      price_unit: this.currency == 'COP' ? PRODUCT.price_cop : PRODUCT.price_usd,
      subtotal: this.getTotalPrice(PRODUCT),
      total: this.getTotalPrice(PRODUCT) * 1,
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

  getTotalPrice(product: any) {
    if (product.discount_g && product.discount_g.type_campaing != 2) {
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
      this.isFlash.emit(false);
    }, 50);
  }
}