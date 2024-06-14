import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeForgotPasswordComponent } from '../code-forgot-password/code-forgot-password.component';
import { NewPasswordComponent } from '../new-password/new-password.component';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
    public toastr: ToastrService
  ) { }

  verifiedMail() {
    if (!this.email) {
      this.toastr.error("Validación", "Ingrese su cuenta de correo");
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
    })
  }

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
  }

  LoadingCode($event: any) {
    this.isLoadingCode = $event;
  }

  CodeValueC($event: any) {
    this.code = $event;
  }
}
