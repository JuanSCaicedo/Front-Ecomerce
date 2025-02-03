import { Component, EventEmitter, Output, Input } from '@angular/core';
import { HomeService } from '../service/home.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, timer } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

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
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Discount Flash");

      // Programar el desbloqueo
      timer(this.BLOCK_DURATION).subscribe(() => {
        this.isBlocked = false;
        this.attemptCount = 0;
        this.toastr.info("Ya puedes volver a agregar productos al carrito", "Desbloqueo Disount Flash");
      });

      return true;
    }

    return false;
  }

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

    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Discount Flash");
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

    if (PRODUCT.variations.length == 0 && this.authService.tokenSubject.value) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    this.homeService.homeView().subscribe(); // Para actualizar la vista mntto de la página principal

    if (!this.authService.tokenSubject.value) {
      this.isProcessing.next(false);
      this.toastr.error("Validación", "Debes iniciar sesión para agregar productos al carrito");
      this.router.navigateByUrl("/login");
      return;
    }

    if (PRODUCT.variations.length > 0) {
      this.isProcessing.next(false);
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
            console.log(error);
            if (error.status == 401) {
              this.authService.sessionExpired();
              this.cartService.clearCart();
            } else {
              this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
            }
          }
        });
    }
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
