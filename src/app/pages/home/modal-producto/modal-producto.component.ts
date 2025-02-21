import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, timer } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
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

  private isProcessing = new BehaviorSubject<boolean>(false);
  private attemptCount = 0;
  private isBlocked = false;
  private lastAttemptTime = Date.now();
  private readonly ATTEMPT_THRESHOLD = 10; // Número máximo de intentos
  private readonly ATTEMPT_WINDOW = 5000; // Ventana de tiempo para contar intentos (5 segundos)
  private readonly BLOCK_DURATION = 10000; // Duración del bloqueo (10 segundos)

  private checkRateLimit(): boolean {
    const now = Date.now();

    // Resetear contador si ha pasado la ventana de tiempo
    if (now - this.lastAttemptTime > this.ATTEMPT_WINDOW) {
      this.attemptCount = 0;
    }

    this.lastAttemptTime = now;
    this.attemptCount++;

    // Si excede el límite de intentos, activar bloqueo
    if (this.attemptCount >= this.ATTEMPT_THRESHOLD) {
      this.isBlocked = true;
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Modal Products");

      // Programar el desbloqueo
      timer(this.BLOCK_DURATION).subscribe(() => {
        this.isBlocked = false;
        this.attemptCount = 0;
        this.toastr.info("Ya puedes volver a agregar productos al carrito", "Desbloqueo Modal Products");
      });

      return true;
    }

    return false;
  }

  constructor(
    private homeService: HomeService,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private toastr: ToastrService,
    public cookieService: CookieService,
  ) { }

  ngOnInit() {
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
    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Modal Products");
      return;
    }

    // Verificar límite de intentos
    if (this.checkRateLimit()) {
      return;
    }

    // Si ya hay una petición en proceso, no permitir otra
    if (this.isProcessing.value) {
      this.toastr.warning("Por favor espera, procesando solicitud anterior", "Procesando");
      return;
    }

    // Marcar como procesando
    this.isProcessing.next(true);

    if (this.authService.tokenSubject.value && this.product_selected.variations.length == 0) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    if (this.product_selected.variations.length > 0 && this.variation_selected && this.sub_variation_selected) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    if (this.product_selected.variations.length > 0 && this.variation_selected && this.variation_selected.subvariations.length == 0) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    if (!this.authService.tokenSubject.value) {
      this.isProcessing.next(false);
      this.toastr.error("Validación", "Debes iniciar sesión para agregar productos al carrito");
      this.router.navigateByUrl("/login");

      $("#producQuickViewModal").modal("hide"); // Oculta el modal
      return;
    }

    if (this.product_selected.variations.length > 0) {
      this.isProcessing.next(false);
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
    let type_campaing_v = null;
    let type_discount_v = null;
    let discount_v = null;

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
      product_id: this.product_selected.id,
      type_discount: type_discount_v,
      discount: discount_v,
      type_campaing: type_campaing_v,
      code_cupon: null,
      code_discount: code_discount_v,
      product_variation_id: product_variation_id,
      quantity: $("#tp-cart-input-val-modal").val(),
      price_unit: this.currency == 'COP' ? this.product_selected.price_cop : this.product_selected.price_usd,
      subtotal: subtotal_v,
      total: subtotal_v * $("#tp-cart-input-val-modal").val(),
      currency: this.currency,
    }

    // Si el usuario está autenticado, registrar el carrito
    if (this.authService.tokenSubject.value) {
      this.cartService.registerCart(data)
        .pipe(
          finalize(() => this.isProcessing.next(false))
        )
        .subscribe({
          next: (resp: any) => {
            if (resp && resp.message == 403) {
              this.toastr.error(resp.message_text, "Validación");
            } else if (resp) {
              this.cartService.changeCart(resp.cart);
              this.toastr.success("Éxito", "Producto agregado al carrito");
            }
          },
          error: (error) => {
            if (error.status == 401) {
              this.authService.sessionExpired();
              this.cartService.clearCart();
            } else if (error.status == 503) {
              this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
              $("#producQuickViewModal").modal("hide"); // Oculta el modal
            } else {
              console.log(error);
              this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
            }
          }
        });
    }
  }

  buyNow() {
    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Modal Products");
      return;
    }

    // Verificar límite de intentos
    if (this.checkRateLimit()) {
      return;
    }

    // Si ya hay una petición en proceso, no permitir otra
    if (this.isProcessing.value) {
      this.toastr.warning("Por favor espera, procesando solicitud anterior", "Procesando");
      return;
    }

    // Marcar como procesando
    this.isProcessing.next(true);

    if (this.authService.tokenSubject.value && this.product_selected.variations.length == 0) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    if (this.product_selected.variations.length > 0 && this.variation_selected && this.sub_variation_selected) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    if (this.product_selected.variations.length > 0 && this.variation_selected && this.variation_selected.subvariations.length == 0) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    if (!this.authService.tokenSubject.value) {
      this.isProcessing.next(false);
      this.toastr.error("Validación", "Debes iniciar sesión para agregar productos al carrito");
      this.router.navigateByUrl("/login");

      $("#producQuickViewModal").modal("hide"); // Oculta el modal
      return;
    }

    if (this.product_selected.variations.length > 0) {
      this.isProcessing.next(false);
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
    let type_campaing_v = null;
    let type_discount_v = null;
    let discount_v = null;

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
      product_id: this.product_selected.id,
      type_discount: type_discount_v,
      discount: discount_v,
      type_campaing: type_campaing_v,
      code_cupon: null,
      code_discount: code_discount_v,
      product_variation_id: product_variation_id,
      quantity: $("#tp-cart-input-val-modal").val(),
      price_unit: this.currency == 'COP' ? this.product_selected.price_cop : this.product_selected.price_usd,
      subtotal: subtotal_v,
      total: subtotal_v * $("#tp-cart-input-val-modal").val(),
      currency: this.currency,
    }

    // Si el usuario está autenticado, registrar el carrito
    if (this.authService.tokenSubject.value) {
      this.cartService.registerCart(data)
        .pipe(
          finalize(() => this.isProcessing.next(false))
        )
        .subscribe({
          next: (resp: any) => {
            if (resp && resp.message == 403) {
              this.toastr.error(resp.message_text, "Validación");
            } else if (resp) {
              this.cartService.changeCart(resp.cart);
              this.toastr.success("Éxito", "Producto agregado al carrito");
              this.router.navigateByUrl("/compra");
              $("#producQuickViewModal").modal("hide"); // Oculta el modal
            }
          },
          error: (error) => {
            if (error.status == 401) {
              this.authService.sessionExpired();
              this.cartService.clearCart();
            } else if (error.status == 503) {
              this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
              $("#producQuickViewModal").modal("hide"); // Oculta el modal
            } else {
              console.log(error);
              this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
            }
          }
        });
    }
  }
}