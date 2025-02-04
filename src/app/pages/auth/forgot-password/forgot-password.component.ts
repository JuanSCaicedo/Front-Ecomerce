import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeForgotPasswordComponent } from '../code-forgot-password/code-forgot-password.component';
import { NewPasswordComponent } from '../new-password/new-password.component';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HomeService } from '../../home/service/home.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CodeForgotPasswordComponent, NewPasswordComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  isLoading$: any;

  isLoadingMail: any = null;
  isLoadingCode: any = null;

  email!: string;
  code!: string;
  new_password!: string;

  constructor(
    public authService: AuthService,
    public toastr: ToastrService,
    public homeService: HomeService
  ) { }

  ngOnInit() {
    this.isLoading$ = this.authService.isLoading$;

    if (typeof window !== 'undefined' && window.localStorage) {
      const storedData = localStorage.getItem('isLoadingMail');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const currentTime = new Date().getTime();
        const expirationTime = 60 * 60 * 1000; // 60 minutos en milisegundos
        // const expirationTime = 3 * 60 * 60 * 1000; // 3 horas en milisegundos

        if (currentTime - parsedData.timestamp < expirationTime) {
          this.isLoadingMail = parseInt(parsedData.value);
        } else {
          localStorage.removeItem('isLoadingMail');
          localStorage.removeItem('isLoadingCode');
          this.isLoadingMail = null;
          this.isLoadingCode = null;
        }
      } else {
        this.isLoadingMail = null;
        this.isLoadingCode = null;
      }
    }

    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);
  }

  verifiedMail() {
    if (!this.email) {
      this.toastr.error("Validación", "Ingrese su cuenta de correo");
      return;
    }

    let data = {
      email: this.email,
    }

    this.authService.verifiedMail(data).subscribe((resp: any) => {
      console.log(resp);
      if (resp.message == 200) {
        this.isLoadingMail = 1;
        const timestamp = new Date().getTime();
        localStorage.setItem('isLoadingMail', JSON.stringify({ value: '1', timestamp: timestamp }));

        this.toastr.success("Éxito", "Código enviado a tu correo");
      } else if (resp.message == 403 && this.email) {
        this.isLoadingMail = null;
        localStorage.removeItem('isLoadingMail');
        this.toastr.error("Validación", "Correo no existe");
      }
    }, (error) => {
      if (error.status == 429) {
        this.toastr.error("Validación", "Has excedido el límite de solicitudes. Por favor, intenta de nuevo en un minuto");
        return;
      } else if (error.status == 503) {
        this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
      } else {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
    })
  }


  LoadingCode($event: any) {
    this.isLoadingCode = $event;
  }

  CodeValueC($event: any) {
    this.code = $event;
  }
}
