import { Inject, PLATFORM_ID, Component } from '@angular/core';
import { MenuCategoriesComponent } from './menu-categories/menu-categories.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformServer } from '@angular/common';
import { CartService } from '../../pages/home/service/cart.service';
import { AuthService } from '../../pages/auth/service/auth.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    public cookieService: CookieService,
    public cartService: CartService,
    public authService: AuthService,
    private toastr: ToastrService,
  ) {
    if (!isPlatformServer(this.platformId)) {
      setTimeout(() => {
        this.isLoading = true;
        setTimeout(() => {
          CurrecyChange($);
        }, 50);
      }, 50);

      this.listadoCarrito();
    }
  }

  ngOnInit() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';
  }

  deleteCart(CART: any) {
    this.cartService.deleteCart(CART.id).subscribe((resp: any) => {
      this.cartService.removeCart(CART);
      this.toastr.info("El producto" + CART.product.title + "fue eliminado del carrito", "Producto eliminado");
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
  }

  listadoCarrito() {
    const token = localStorage.getItem('token');

    if (token) {
      this.authService.tokenSubject.next(token); // Sincroniza el token

      this.cartService.listCart().subscribe((resp: any) => {
        if (resp.carts.data.length > 0) {
          resp.carts.data.forEach((cart: any) => {
            this.cartService.changeCart(cart);
          });
        } else {
          this.cartService.clearCart();
        }
      }, (error) => {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      });
    }

    this.cartService.currentDataCart$.subscribe((resp: any) => {
      this.listCart = resp;
      this.totalCarts = this.listCart.reduce((sum: number, item: any) => sum + item.total, 0);
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
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
}
