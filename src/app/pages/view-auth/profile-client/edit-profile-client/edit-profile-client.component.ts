import { Component } from '@angular/core';
import { ProfileClientService } from '../service/profile-client.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/service/auth.service';
import { CartService } from '../../../home/service/cart.service';
import { HomeService } from '../../../home/service/home.service';

@Component({
  selector: 'app-edit-profile-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile-client.component.html',
  styleUrl: './edit-profile-client.component.css'
})
export class EditProfileClientComponent {

  name: string = '';
  surname: string = '';
  email: string = '';
  phone: string = '';
  bio: string = '';
  fb: string = '';
  tw: string = '';
  sexo: string = '';
  description: string = '';
  address_city: string = '';
  file_imagen: any;
  imagen_previsualiza: any;

  constructor(
    public profileClient: ProfileClientService,
    public toastr: ToastrService,
    public authService: AuthService,
    public cartService: CartService,
    public homeService: HomeService,
  ) {
    this.showUser();
  }

  updateProfile() {

  }

  showUser() {
    this.profileClient.showUsers().subscribe((resp: any) => {
      console.log(resp);
      this.name = resp.name
      this.surname = resp.surname
      this.email = resp.email
      this.phone = resp.phone
      this.bio = resp.bio
      this.fb = resp.fb
      this.tw = resp.tw
      this.sexo = resp.sexo
      this.address_city = resp.address_city
      this.imagen_previsualiza = resp.avatar;
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
}
