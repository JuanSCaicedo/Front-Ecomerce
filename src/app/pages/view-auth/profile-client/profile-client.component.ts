import { Component } from '@angular/core';
import { EditProfileClientComponent } from './edit-profile-client/edit-profile-client.component';
import { AddressProfileClientComponent } from './address-profile-client/address-profile-client.component';
import { OrdersProfileClientComponent } from './orders-profile-client/orders-profile-client.component';
import { PasswordProfileClientComponent } from './password-profile-client/password-profile-client.component';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../../home/service/cart.service';

@Component({
  selector: 'app-profile-client',
  standalone: true,
  imports: [EditProfileClientComponent, AddressProfileClientComponent, OrdersProfileClientComponent, PasswordProfileClientComponent, CommonModule],
  templateUrl: './profile-client.component.html',
  styleUrl: './profile-client.component.css'
})
export class ProfileClientComponent {

  selected_tab: number = 0;
  totalOrdersCount: number = 0;
  listCart: any = [];
  user: any = {};
  file_imagen: any;
  imagen_previsualiza: any;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    public cartService: CartService,
  ) { }

  ngOnInit() {
    this.scrollToUp();
    this.carrito();
  }

  scrollToUp() {
    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);
  }

  selectTab(val: number) {
    this.selected_tab = val;
  }

  logout() {
    let token = localStorage.getItem('token');

    if (token) {
      this.authService.logout();
      this.toastr.success("Éxito", "Sesión cerrada");
    }
  }

  updateTotalOrders(total: number) {
    this.totalOrdersCount = total;
  }

  carrito() {
    this.cartService.currentDataCart$.subscribe((resp: any) => {
      this.listCart = resp;
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

  viewUser(viewUser: any) {
    this.user = viewUser;
  }
}
