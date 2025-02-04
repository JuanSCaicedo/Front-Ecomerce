import { Inject, PLATFORM_ID, Component } from '@angular/core';
import { MenuCategoriesComponent } from './menu-categories/menu-categories.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformServer } from '@angular/common';
import { CartService } from '../../pages/home/service/cart.service';
import { AuthService } from '../../pages/auth/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs';
import { BehaviorSubject, timer } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { HomeService } from '../../pages/home/service/home.service';

declare function CurrecyChange([]): any;
declare var $: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenuCategoriesComponent, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  currency: string = 'COP';
  isLoading: boolean = false;

  user: any;
  listCart: any = [];
  totalCarts: number = 0;

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
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    public cookieService: CookieService,
    public cartService: CartService,
    public authService: AuthService,
    private toastr: ToastrService,
    private homeService: HomeService,
  ) {
    if (!isPlatformServer(this.platformId)) {
      setTimeout(() => {
        this.isLoading = true;
        setTimeout(() => {
          CurrecyChange($);
        }, 50);
      }, 50);

      this.cambioVista();
    }
  }

  ngOnInit() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';
  }

  cambioVista() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      let token = localStorage.getItem('token');
      if (token) {
        this.listadoCarrito(token);
      } else {
        this.cartService.clearCart();
      }
    });
  }

  listadoCarrito(token: any) {
    this.authService.tokenSubject.next(token); // Sincroniza el token

    if (this.authService.tokenSubject.value) {

      this.cartService.listCart().subscribe((resp: any) => {
        if (resp.carts.data.length > 0) {
          resp.carts.data.forEach((cart: any) => {
            this.cartService.changeCart(cart);
          });
        } else {
          this.cartService.clearCart();
        }
      }, (error) => {
        if (error.status == 401) {
          this.authService.sessionExpired();
          this.cartService.clearCart();
        } else if (error.status == 503) {
          this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
        } else {
          console.log(error);
          this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
        }
      });


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
    } else {
      this.cartService.clearCart();
    }
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
  }

  navigateToHome() {
    if (this.router.url === '/') {
      // Si ya estás en el home, desplázate hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si no estás en el home, redirige al home
      this.router.navigate(['/']);
    }
  }

  changeCurrency(val: string) {
    this.cookieService.set('currency', val);
    setTimeout(() => {
      window.location.reload();
    }, 50);
  }

  logout() {
    let token = localStorage.getItem('token');

    if (token) {
      this.authService.logout();
      this.toastr.success("Éxito", "Sesión cerrada");
    }
  }
}
