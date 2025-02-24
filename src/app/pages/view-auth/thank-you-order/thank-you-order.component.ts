import { Component } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/service/auth.service';
import { HomeService } from '../../home/service/home.service';
declare function background([]): any;
declare var $: any;

@Component({
  selector: 'app-thank-you-order',
  standalone: true,
  imports: [],
  templateUrl: './thank-you-order.component.html',
  styleUrl: './thank-you-order.component.css'
})
export class ThankYouOrderComponent {
  ORDER_SELECTED: any;
  ORDER_SELECTED_ID: any;

  constructor(
    public cartService: CartService,
    public activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    private homeService: HomeService,
  ) {
    activatedRoute.params.subscribe((resp: any) => {
      this.ORDER_SELECTED_ID = resp.order;
    }, error => {
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
    });

    this.showOrder();
  }

  ngOnInit() {
    background($);
    this.scrollToUp();
  }

  showOrder() {
    this.cartService.showOrder(this.ORDER_SELECTED_ID).subscribe((resp: any) => {
      console.log(resp);
    }, error => {
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
    });
  }

  scrollToUp() {
    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);

  }
}
