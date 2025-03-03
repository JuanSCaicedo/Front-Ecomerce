import { Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ModalProductoComponent } from '../../home/modal-producto/modal-producto.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../../home/service/cart.service';
import { BehaviorSubject, timer } from 'rxjs';
import { finalize } from 'rxjs/operators';

declare function MODAL_PRODUCT_DETAIL([]): any;
declare function LANDING_PRODUCT([]): any;
declare function COUNTER([]): any;
declare function LINEA([]): any;
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
  sub_variation_selected: any;
  PRODUCT_RELATEDS: any = [];
  product_relateds_count: boolean = false;
  product_selected_modal: any;
  CAMPAING_CODE: any;
  DISCOUNT_CAMPAING: any;
  param: boolean = false;
  EXIST_CAMPAING: boolean = false;

  sanitizedDescription!: SafeHtml;
  currency: string = 'COP';
  MANTINANCE_STATUS: boolean = false;
  is_flash: boolean = false;
  plus: number = 0;
  reviews: any = [];
  rating_distribution: any = [];
  one: number = 0;
  two: number = 0;
  three: number = 0;
  four: number = 0;
  five: number = 0;

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
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Landing Products");

      // Programar el desbloqueo
      timer(this.BLOCK_DURATION).subscribe(() => {
        this.isBlocked = false;
        this.attemptCount = 0;
        this.toastr.info("Ya puedes volver a agregar productos al carrito", "Desbloqueo Landing Products");
      });

      return true;
    }

    return false;
  }

  constructor(
    public homeService: HomeService,
    public activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private sanitizer: DomSanitizer,
    public cookieService: CookieService,
    private authService: AuthService,
    private cartService: CartService,
  ) {
    this.queryParams(); // Llama a la función para obtener los parámetros de la URL
    this.params(); // Llama a la función para obtener los parámetros de la URL
  }

  ngOnInit() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';
  }

  queryParams() {
    this.activatedRoute.queryParams.subscribe((resp: any) => {
      this.CAMPAING_CODE = resp.campaing_discount; // Actualiza CAMPAING_CODE

      if (this.CAMPAING_CODE) {
        this.is_flash = true;
      } else {
        this.is_flash = false;
      }
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
  }

  params() {
    // Escuchar cambios en los parámetros de la ruta
    this.activatedRoute.params.subscribe((resp: any) => {
      this.PRODUCT_SLUG = resp.slug; // Actualiza el slug
      this.loadProductDetails(); // Llama a la función para cargar los datos del 
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
  }

  // Función para cargar los detalles del producto
  loadProductDetails() {
    this.variation_selected = null;
    this.sub_variation_selected = null;

    this.homeService.showProduct(this.PRODUCT_SLUG, this.CAMPAING_CODE).subscribe((resp: any) => {
      console.log(resp);

      if (resp.message == 403) {
        this.router.navigateByUrl("/error/404");
        this.toastr.error("Validación", resp.message_text, {
          closeButton: true,    // Muestra un botón para cerrar
          progressBar: true,    // Muestra una barra de progreso
          tapToDismiss: true    // Permite cerrar al hacer clic
        });

        this.cerrarAlerta();
      } else {
        this.PRODUCT_SELECTED = resp.product;

        // Sanitizar la descripción después de cargar los datos
        this.sanitizedDescription = this.sanitizer.bypassSecurityTrustHtml(
          this.PRODUCT_SELECTED.description
        );

        this.PRODUCT_RELATEDS = resp.product_relateds.data;
        this.product_relateds_count = this.PRODUCT_RELATEDS.length > 0;
        this.DISCOUNT_CAMPAING = resp.discount_campaing;
        this.reviews = resp.reviews;

        // Agregar validación para DISCOUNT_CAMPAING
        if (this.CAMPAING_CODE && !this.DISCOUNT_CAMPAING) {
          this.toastr.warning('La campaña no es válida para este producto', 'Aviso', {
            closeButton: true,    // Muestra un botón para cerrar
            progressBar: true,    // Muestra una barra de progreso
            tapToDismiss: true    // Permite cerrar al hacer clic
          });

          this.cerrarAlerta();
        }

        // Agregar validación para DISCOUNT_CAMPAING
        if (this.DISCOUNT_CAMPAING) {
          this.PRODUCT_SELECTED.discount_g = this.DISCOUNT_CAMPAING;
        }

        this.rating_distribution = resp.rating_distribution;
        // Accediendo a los valores y asignándolos a variables con nombres descriptivos
        this.one = this.rating_distribution[1];
        this.two = this.rating_distribution[2];
        this.three = this.rating_distribution[3];
        this.four = this.rating_distribution[4];
        this.five = this.rating_distribution[5];
      }

      if (typeof $ !== 'undefined') {
        setTimeout(() => {
          MODAL_PRODUCT_DETAIL($);
          $('#tp-cart-input-val').val(1); // Reinicia la cantidad a 1
          COUNTER($);
          LANDING_PRODUCT($);
        }, 50);
      }

      if (this.PRODUCT_SELECTED?.images) {
        this.filtered_images = this.getRandomImages(this.PRODUCT_SELECTED.images, 5);
      }

      // Restablece las clases activas al cargar un nuevo producto
      this.resetActiveClasses();

      // Realiza scroll hacia la parte superior de la página
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
        }
      }, 0);
    }, (err: any) => {
      if (err.status == 503) {
        this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
      } else {
        console.log(err);
        this.toastr.error('API Response - Comuniquese con el desarrollador', err.error.message || err.message);
      }
    });
  }

  // Método para obtener N elementos aleatorios
  getRandomImages(images: any[], count: number): any[] {
    return [...images]
      .sort(() => Math.random() - 0.5) // Baraja las imágenes
      .slice(0, count); // Obtiene los primeros 'count' elementos
  }

  getNewTotal(PRODUCT: any, DISCOUNT_FLASH_P: any) {
    if (this.currency == 'COP') {
      if (DISCOUNT_FLASH_P.type_discount == 1) {
        return ((PRODUCT.price_cop + this.plus) - (PRODUCT.price_cop + this.plus) * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2);
      } else {
        return ((PRODUCT.price_cop + this.plus) - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    } else {
      if (DISCOUNT_FLASH_P.type_discount == 1) {
        return ((PRODUCT.price_usd + this.plus) - (PRODUCT.price_usd + this.plus) * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2);
      } else {
        return ((PRODUCT.price_usd + this.plus) - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }
  }

  getTotalPriceProduct(PRODUCT: any) {
    if (PRODUCT.discount_g && PRODUCT.discount_g.type_campaing != 2) {
      return this.getNewTotal(PRODUCT, PRODUCT.discount_g);
    }
    if (this.currency == 'COP') {
      return (PRODUCT.price_cop + this.plus).toFixed(2);  // Añadir this.plus
    } else {
      return (PRODUCT.price_usd + this.plus).toFixed(2);  // Añadir this.plus
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
    this.plus = 0;

    setTimeout(() => {
      this.plus += variation.add_price;
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  selectedSubVariation(subvariation: any) {
    this.sub_variation_selected = null;
    this.plus = this.variation_selected.add_price;

    setTimeout(() => {
      this.plus += subvariation.add_price;
      this.sub_variation_selected = subvariation;
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

  // Nueva función para resetear las clases activas
  resetActiveClasses() {
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        // Busca los elementos con las clases activas y las remueve
        const activeNavLinks = document.querySelectorAll('.nav-link.active');
        activeNavLinks.forEach((element) => {
          element.classList.remove('active');
          element.setAttribute('aria-selected', 'false');
        });

        const activeTabPanes = document.querySelectorAll('.tab-pane.show.active');
        activeTabPanes.forEach((element) => {
          element.classList.remove('show', 'active');
        });

        // Activa los elementos por defecto (el primer botón y el primer panel)
        const firstNavLink = document.querySelector('.nav-link');
        const firstTabPane = document.querySelector('.tab-pane');
        const opcSelect = document.querySelector('.opc-select');
        const InfSelect = document.querySelector('.inf-select');

        if (firstNavLink) {
          firstNavLink.classList.add('active');
          firstNavLink.setAttribute('aria-selected', 'true');
        }

        if (firstTabPane) {
          firstTabPane.classList.add('show', 'active');
        }

        if (opcSelect) {
          opcSelect.classList.add('show', 'active');
        }

        if (InfSelect) {
          InfSelect.classList.add('show', 'active');
        }

        // Llamada a tp_tab_line_2 para actualizar la posición del marcador
        setTimeout(() => {
          LINEA($);
        }, 50);
      }, 50); // Da un pequeño tiempo para asegurarse de que el DOM esté cargado
    }
  }

  cerrarAlerta() {
    if (typeof $ !== 'undefined') {
      // Ocultar después de 3 segundos
      setTimeout(() => {
        const toastElement = document.querySelector('.toast-container') as HTMLElement;
        if (toastElement) {
          toastElement.style.display = 'none';
        }
      }, 3000);

      // Agregar evento click para ocultar
      const toastElement = document.querySelector('.toast-container') as HTMLElement;
      if (toastElement) {
        toastElement.addEventListener('click', () => {
          toastElement.style.display = 'none';
        });
      }
    }
  }

  handleCartAction(redirectToCheckout: boolean) {
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Landing Products");
      return;
    }

    if (this.checkRateLimit()) {
      return;
    }

    if (this.isProcessing.value) {
      this.toastr.warning("Por favor espera, procesando solicitud anterior", "Procesando");
      return;
    }

    this.isProcessing.next(true);

    // Mostrar mensajes de información al usuario
    if (this.authService.tokenSubject.value && this.PRODUCT_SELECTED.variations.length == 0) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    if (this.PRODUCT_SELECTED.variations.length > 0 && this.variation_selected && this.sub_variation_selected) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    if (this.PRODUCT_SELECTED.variations.length > 0 && this.variation_selected && this.variation_selected.subvariations.length == 0) {
      this.toastr.info("Agregando producto al carrito", "Procesando");
    }

    if (!this.authService.tokenSubject.value) {
      this.isProcessing.next(false);
      this.toastr.error("Validación", "Debes iniciar sesión para agregar productos al carrito");
      this.router.navigateByUrl("/login");
      return;
    }

    if (this.PRODUCT_SELECTED.variations.length > 0) {
      if (!this.variation_selected) {
        this.isProcessing.next(false);
        this.toastr.error("Validación", "Debes seleccionar una variación");
        return;
      }

      if (this.variation_selected.subvariations.length > 0 && !this.sub_variation_selected) {
        this.isProcessing.next(false);
        this.toastr.error("Validación", "Debes seleccionar una sub-variación");
        return;
      }
    }

    const product_variation_id = this.sub_variation_selected?.id || this.variation_selected?.id || null;
    const discount_g = this.PRODUCT_SELECTED.discount_g || null;

    // Determinar los valores de descuento según type_campaing
    let code_discount_v = null;
    let type_campaing_v = null;
    let discount_v = null;
    let type_discount_v = null;

    if (discount_g) {
      if (discount_g.type_campaing == 2) {
        // Solo aplicar descuento de campaña tipo 2 si es flash
        if (this.is_flash) {
          code_discount_v = discount_g.code;
          type_campaing_v = discount_g.type_campaing;
          discount_v = discount_g.discount;
          type_discount_v = discount_g.type_discount;
        }
      } else {
        // Para otros tipos de campaña, aplicar normalmente
        code_discount_v = discount_g.code;
        type_campaing_v = discount_g.type_campaing;
        discount_v = discount_g.discount;
        type_discount_v = discount_g.type_discount;
      }
    }

    const subtotal_v = discount_g && discount_g.type_campaing == 2 && this.is_flash
      ? this.getTotalPriceProductFlash(this.PRODUCT_SELECTED)
      : this.getTotalPriceProduct(this.PRODUCT_SELECTED);

    const data = {
      product_id: this.PRODUCT_SELECTED.id,
      type_discount: type_discount_v,
      discount: discount_v,
      type_campaing: type_campaing_v,
      code_cupon: null,
      code_discount: code_discount_v,
      product_variation_id: product_variation_id,
      quantity: $("#tp-cart-input-val").val(),
      price_unit: this.currency == 'COP' ? this.PRODUCT_SELECTED.price_cop : this.PRODUCT_SELECTED.price_usd,
      subtotal: subtotal_v,
      total: subtotal_v * $("#tp-cart-input-val").val(),
      currency: this.currency,
    };

    this.cartService.registerCart(data)
      .pipe(finalize(() => this.isProcessing.next(false)))
      .subscribe({
        next: (resp: any) => {
          if (resp?.message == 403) {
            this.toastr.error(resp.message_text, "Validación");
          } else if (resp) {
            this.cartService.changeCart(resp.cart);
            this.toastr.success("Éxito", "Producto agregado al carrito");
            if (redirectToCheckout) {
              this.router.navigateByUrl("/compra");
            }
          }
        },
        error: (error) => {
          if (error.status == 401) {
            this.authService.sessionExpired();
            this.cartService.clearCart();
          } else if (error.status == 503) {
            this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
          } else {
            console.log(error);
            this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
          }
        }
      });
  }

  // Llama la función según el flujo deseado
  addCart() {
    this.handleCartAction(false); // Solo agrega al carrito
  }

  buyNow() {
    this.handleCartAction(true); // Agrega y redirige a compra
  }

  addCartRelated(PRODUCT: any) {
    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Landing Products");
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
    let type_campaing_v = null;
    let type_discount_v = null;
    let discount_v = null;

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
      subtotal: this.getTotalPriceProduct(PRODUCT),
      total: this.getTotalPriceProduct(PRODUCT) * 1,
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
            if (error.status == 401) {
              this.authService.sessionExpired();
              this.cartService.clearCart();
            } else if (error.status == 503) {
              this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
            } else {
              console.log(error);
              this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
            }
          }
        });
    }
  }
}