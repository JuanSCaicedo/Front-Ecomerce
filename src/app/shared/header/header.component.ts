import { Inject, PLATFORM_ID, Component } from '@angular/core';
import { MenuCategoriesComponent } from './menu-categories/menu-categories.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformServer } from '@angular/common';

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

  constructor(
    private router: Router,
    public cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
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
