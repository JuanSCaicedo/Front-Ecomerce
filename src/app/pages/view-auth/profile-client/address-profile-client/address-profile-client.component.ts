import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserAddressService } from '../../service/user-address.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth/service/auth.service';
import { CartService } from '../../../home/service/cart.service';
import { HomeService } from '../../../home/service/home.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, finalize, tap, timer } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-address-profile-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-profile-client.component.html',
  styleUrl: './address-profile-client.component.css'
})
export class AddressProfileClientComponent {

  address_list: any = [];
  address_selected: any;

  name: string = '';
  surname: string = '';
  company: string = '';
  country_region: string = '';
  city: string = '';
  address: string = '';
  street: string = '';
  postcode_zip: string = '';
  phone: string = '';
  email: string = '';

  private isProcessing = new BehaviorSubject<boolean>(false);
  @ViewChild('billingDetails') billingDetails?: ElementRef;
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
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Rate Limit");

      // Programar el desbloqueo
      timer(this.BLOCK_DURATION).subscribe(() => {
        this.isBlocked = false;
        this.attemptCount = 0;
        this.toastr.info("Se ha desbloqueado el sistema", "Desbloqueado - Rate Limit");
      });

      return true;
    }

    return false;
  }

  constructor(
    public addressService: UserAddressService,
    private toastr: ToastrService,
    private authService: AuthService,
    private cartService: CartService,
    public homeService: HomeService,
    public router: Router,
  ) {
    this.listarDirecciones();
  }

  listarDirecciones() {
    this.addressService.listAddress().subscribe((resp: any) => {
      console.log(resp);
      this.address_list = resp.address;
    }, (error) => {
      if (error.status == 401) {
        this.authService.sessionExpired();
        this.router.navigateByUrl('/login');
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

  resetAddress() {
    this.scrolltoBillingDetails();
    this.address_selected = null;
    this.name = '';
    this.surname = '';
    this.company = '';
    this.country_region = '';
    this.city = '';
    this.address = '';
    this.street = '';
    this.postcode_zip = '';
    this.phone = '';
    this.email = '';
  }

  selectedAddress(addres: any) {
    this.scrolltoBillingDetails();
    this.address_selected = addres;
    this.name = this.address_selected.name;
    this.surname = this.address_selected.surname;
    this.company = this.address_selected.company;
    this.country_region = this.address_selected.country_region;
    this.city = this.address_selected.city;
    this.address = this.address_selected.address;
    this.street = this.address_selected.street;
    this.postcode_zip = this.address_selected.postcode_zip;
    this.phone = this.address_selected.phone;
    this.email = this.address_selected.email;
  }

  registerAddress() {
    let token = localStorage.getItem('token');

    if (!token) {
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
      return;
    }

    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Registrar Dirección");
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


    if (!this.name || !this.surname || !this.company || !this.country_region || !this.city || !this.address || !this.street || !this.postcode_zip || !this.phone || !this.email) {
      this.toastr.error('Todos los campos son obligatorios', 'Validación');
      this.isProcessing.next(false);
      return;
    } else {
      this.toastr.info("Registrando dirección, espere...", "Registrando dirección");
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      city: this.city,
      address: this.address,
      street: this.street,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email
    }

    this.addressService.registerAddress(data)
      .pipe(
        tap((resp: any) => {
          console.log(resp);
          this.toastr.success("Dirección registrada correctamente", "Éxito");
          this.address_selected = resp.addres;
          this.scrollToUp();
          this.address_list.unshift(resp.addres);
        }),
        finalize(() => {
          // Finaliza el estado de procesamiento
          this.isProcessing.next(false);
        })
      )
      .subscribe({
        next: () => { },
        error: (error) => {
          if (error.status == 401) {
            this.authService.sessionExpired();
            this.router.navigateByUrl('/login');
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
        }
      });
  }

  editAddress() {
    let token = localStorage.getItem('token');

    if (!token) {
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
      this.router.navigateByUrl('/login');
      return;
    }

    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Registrar Dirección");
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


    if (!this.name || !this.surname || !this.company || !this.country_region || !this.city || !this.address || !this.street || !this.postcode_zip || !this.phone || !this.email) {
      this.toastr.error('Todos los campos son obligatorios', 'Validación');
      this.isProcessing.next(false);
      return;
    } else {
      this.toastr.info("Actualizando dirección, espere...", "Actualizando dirección");
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      city: this.city,
      address: this.address,
      street: this.street,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email
    }

    this.addressService.updateAddress(this.address_selected.id, data)
      .pipe(
        tap((resp: any) => {
          console.log(resp);
          this.toastr.success("Dirección actualizada correctamente", "Éxito");
          this.scrolltoBillingDetails();

          let INDEX = this.address_list.findIndex((item: any) => item.id == resp.addres.id);

          if (INDEX != -1) {
            this.address_list[INDEX] = resp.addres;
          }
        }),
        finalize(() => {
          // Finaliza el estado de procesamiento
          this.isProcessing.next(false);
        })
      )
      .subscribe({
        next: () => { },
        error: (error) => {
          if (error.status == 401) {
            this.authService.sessionExpired();
            this.router.navigateByUrl('/login');
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
        }
      });
  }

  scrolltoBillingDetails() {
    if (this.billingDetails) {
      this.billingDetails.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
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
