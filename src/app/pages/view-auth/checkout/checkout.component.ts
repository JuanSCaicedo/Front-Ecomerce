import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../home/service/cart.service';
import { AuthService } from '../../auth/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, finalize, tap, timer } from 'rxjs';
import { HomeService } from '../../home/service/home.service';
declare function checkout([]): any;
declare var $: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  selectedPayment: string = '';

  listCart: any = [];
  totalCarts: number = 0;
  currency: string = 'COP';
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
    public authService: AuthService,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private homeService: HomeService,
  ) { }

  ngOnInit() {
    this.iniciarProyecto();
    this.carritoCompra();
  }

  iniciarProyecto() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';

    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);

    // Inicializa el script de checkout
    checkout($);
  }

  carritoCompra() {
    this.cartService.currentDataCart$.subscribe((resp: any) => {
      this.listCart = resp;
      this.totalCarts = this.listCart.reduce((sum: number, item: any) => sum + item.total, 0);
    }, (error) => {
      console.log(error);
      if (error.status == 401) {
        this.authService.sessionExpired();
        this.cartService.clearCart();
      } else {
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
    });
  }

  appyCupon() {

    this.toastr.info("Aplicando cupón, espere...", "Aplicando cupón");
    
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
