import { Component } from '@angular/core';
import { CartService } from '../../../home/service/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../auth/service/auth.service';
import { HomeService } from '../../../home/service/home.service';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css'
})
export class CheckoutSuccessComponent {
  payment_id: string = '';
  preference_id: string = '';
  currency: string = 'COP';

  constructor(
    public cartService: CartService,
    public activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public cookieService: CookieService,
    public authService: AuthService,
    public homeService: HomeService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';
    this.inciarProyecto();
  }

  inciarProyecto() {
    this.activatedRoute.queryParams.subscribe((resp: any) => {
      console.log(resp);
      this.payment_id = resp.payment_id;
      this.preference_id = resp.preference_id;
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

    let data = {
      method_payment: 'MERCADOPAGO',
      currency_total: this.currency,
      currency_payment: 'COP',
      discount: 0,
      price_dolar: 0,
      n_transaccion: this.payment_id,
      preference_id: this.preference_id,
    }

    this.cartService.checkoutMercadoPago(data).subscribe((resp: any) => {
      console.log(resp);
      this.toastr.success("Compra realizada correctamente", "Éxito");
      this.router.navigateByUrl("/gracias-por-tu-compra/" + this.payment_id);
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
}
