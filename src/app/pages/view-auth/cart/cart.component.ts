import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, timer } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { AuthService } from '../../auth/service/auth.service';
import { HomeService } from '../../home/service/home.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  currency: string = 'COP';
  listCart: any = [];
  totalCarts: number = 0;
  code_cupon: string = '';

  private isProcessing = new BehaviorSubject<boolean>(false);
  private attemptCount = 0;
  private isBlocked = false;
  private lastAttemptTime = Date.now();
  private readonly ATTEMPT_THRESHOLD = 20; // Número máximo de intentos
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
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Rate Limit");

      // Programar el desbloqueo
      timer(this.BLOCK_DURATION).subscribe(() => {
        this.isBlocked = false;
        this.attemptCount = 0;
        this.toastr.info("Se ha desbloqueado el sistema", "Desbloqueado - Rate Limit");
      });

      return true;
    }

    return false;
  }

  constructor(
    public cartService: CartService,
    private cookieService: CookieService,
    private toastr: ToastrService,
    private authService: AuthService,
    private homeService: HomeService,
    public router: Router,
  ) { }

  ngOnInit() {
    if (!this.authService.tokenSubject.value) {
      console.log(this.authService.tokenSubject.value);
      this.router.navigateByUrl("/");
      this.toastr.warning("Por favor inicie sesión", "Sesión no iniciada");
      return;
    }

    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';

    this.cartService.currentDataCart$.subscribe((resp: any) => {
      this.listCart = resp;
      //Que solo se vean dos decimales
      this.totalCarts = this.listCart.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2);
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });

    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);
  }

  deleteCart(CART: any) {
    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Delete Products Cart");
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

    this.toastr.info("Eliminando producto del carrito, espere...", "Eliminando producto");

    let token = localStorage.getItem('token');

    if (token) {
      this.borrarCarrito(CART);
    }
  }

  borrarCarrito(CART: any) {
    this.cartService.deleteCart(CART.id)
      .pipe(
        tap(() => {
          this.cartService.removeCart(CART);
          this.toastr.info(`El producto ${CART.product.title} fue eliminado del carrito`, "Producto eliminado");
        }),
        finalize(() => this.isProcessing.next(false))
      )
      .subscribe({
        next: () => { },
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

  minusQuantity(cart: any) {
    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Update Products Cart");
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

    if (cart.quantity == 1) {
      this.toastr.error("La cantidad mínima es 1", "Validación");
      this.isProcessing.next(false);
      return;
    }

    this.toastr.info("Actualizando cantidad del producto, espere...", "Actualizando producto");

    cart.quantity = cart.quantity - 1;
    cart.total = cart.subtotal * cart.quantity;

    this.actualizarCarro(cart);
  }

  plusQuantity(cart: any) {
    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Update Products Cart");
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

    this.toastr.info("Actualizando cantidad del producto, espere...", "Actualizando producto");

    cart.quantity = cart.quantity + 1;
    cart.total = cart.subtotal * cart.quantity;

    this.actualizarCarro(cart);
  }

  actualizarCarro(cart: any) {
    let token = localStorage.getItem('token');

    if (token) {
      this.cartService.updateCart(cart.id, cart)
        .pipe(
          tap((resp: any) => {
            if (resp.message == 403) {
              // Si el stock no es suficiente, mostrar mensaje de error
              this.toastr.error("La cantidad solicitada excede el stock disponible", "Validación");
            } else {
              // Si la actualización fue exitosa, actualizar el carrito y mostrar mensaje
              this.cartService.changeCart(resp.cart);
              this.toastr.info("La cantidad del producto fue actualizada", "Producto actualizado");
            }
          }),
          finalize(() => {
            // Marcar como no procesando al finalizar
            this.isProcessing.next(false);
          })
        )
        .subscribe({
          next: () => { },
          error: (error) => {
            // Manejo de errores según el código de estado
            if (error.status == 401) {
              this.authService.sessionExpired();
              this.cartService.clearCart();
            } else if (error.status == 503) {
              this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
            } else if (error.status == 429) {
              this.toastr.error("Demasiadas solicitudes. Por favor, espere unos segundos.", "Error de solicitud");
              return;
            }
            else {
              console.log(error);
              this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
            }
          }
        });
    } else {
      // Si no hay token, mostrar mensaje de error
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
    }
  }

  appyCupon() {
    let token = localStorage.getItem('token');

    if (!token) {
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
      return;
    }

    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Aplicar Cupón");
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

    if (!this.code_cupon) {
      this.toastr.error("El código del cupón no puede estar vacío", "Validación");
      this.isProcessing.next(false);
      return;
    }

    let data = {
      code_cupon: this.code_cupon
    };

    this.cartService.applyCupon(data)
      .pipe(
        tap((resp: any) => {
          console.log(resp);
          if (resp.message == 403) {
            this.toastr.error(resp.message_text, "Validación");
            return;
          } else {
            this.toastr.info(resp.message_text, "Cupón aplicado correctamente");
            this.cartService.resetCart();
            this.cartService.listCart().subscribe((resp: any) => {
              if (resp.carts.data.length > 0) {
                resp.carts.data.forEach((cart: any) => {
                  this.cartService.changeCart(cart);
                });
              } else {
                this.cartService.clearCart();
              }
            }, (error) => {
              // Manejo de errores según el código de estado
              if (error.status == 401) {
                this.authService.sessionExpired();
                this.cartService.clearCart();
              } else if (error.status == 503) {
                this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
              } else if (error.status == 429) {
                this.toastr.error("Demasiadas solicitudes. Por favor, espere unos segundos.", "Error de solicitud");
                return;
              }
              else {
                console.log(error);
                this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
              }
            });
          }
        }),
        finalize(() => {
          // Marcar como no procesando al finalizar
          this.isProcessing.next(false);
        })
      )
      .subscribe({
        next: () => { },
        error: (error) => {
          if (error.status == 401) {
            this.authService.sessionExpired();
            this.cartService.clearCart();
          } else if (error.status == 503) {
            this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
          } else if (error.status == 429) {
            this.toastr.error("Demasiadas solicitudes. Por favor, espere unos segundos.", "Error de solicitud");
            return;
          } else {
            console.log(error);
            this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
          }
        }
      });
  }
}
