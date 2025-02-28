import { Component } from '@angular/core';
import { ProfileClientService } from '../service/profile-client.service';
import { AuthService } from '../../../auth/service/auth.service';
import { CartService } from '../../../home/service/cart.service';
import { HomeService } from '../../../home/service/home.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders-profile-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-profile-client.component.html',
  styleUrl: './orders-profile-client.component.css'
})
export class OrdersProfileClientComponent {
  sales: any = [];
  selectedSaleId: number | null = null; // Variable para almacenar la venta activa

  constructor(
    public profileCliente: ProfileClientService,
    public authService: AuthService,
    public cartService: CartService,
    public homeService: HomeService,
    public toastr: ToastrService,
  ) {
    this.showOrders();
  }

  showOrders() {
    this.profileCliente.showOrders().subscribe((resp: any) => {
      console.log(resp);
      this.sales = resp.sales.data;
    }, (error) => {
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
        this.toastr.error('API Response - Comuníquese con el desarrollador', error.error.message || error.message);
      }
    });
  }  

  detailShow(sale: any) {
    if (this.selectedSaleId === sale.id) {
      this.selectedSaleId = null; // Si es el mismo, lo oculta
    } else {
      this.selectedSaleId = sale.id; // Asigna el nuevo ID para mostrar su detalle
    }
  }
}
