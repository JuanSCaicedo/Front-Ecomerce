import { Inject, PLATFORM_ID, Component } from '@angular/core';
import { MenuCategoriesComponent } from './menu-categories/menu-categories.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformServer } from '@angular/common';
import { CartService } from '../../pages/home/service/cart.service';

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

  constructor(
    private router: Router,
    public cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public cartService: CartService,
  ) {
    if (!isPlatformServer(this.platformId)) {
      setTimeout(() => {
        this.isLoading = true;
        setTimeout(() => {
          CurrecyChange($);
        }, 50);
      }, 50);
    }
  }

  ngOnInit() {
    this.user = this.cartService.authService.user;

    if (this.user) {
      this.cartService.listCart().subscribe((resp: any) => {
        console.log(resp);
      });
    }
  }

  ngAfterViewInit() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';
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
