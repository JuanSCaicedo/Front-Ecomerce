import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, timer } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../auth/service/auth.service';

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
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Delete Products Cart");

      // Programar el desbloqueo
      timer(this.BLOCK_DURATION).subscribe(() => {
        this.isBlocked = false;
        this.attemptCount = 0;
        this.toastr.info("Ya puedes volver a agregar productos al carrito", "Desbloqueo Delete Products Cart");
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
    private router: Router,
  ) { }

  ngOnInit() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';

    this.cartService.currentDataCart$.subscribe((resp: any) => {
      if (resp.length > 0) {
        this.listCart = resp;
        this.totalCarts = this.listCart.reduce((sum: number, item: any) => sum + item.total, 0);
      } else {
        this.router.navigateByUrl('/login');
      }
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
