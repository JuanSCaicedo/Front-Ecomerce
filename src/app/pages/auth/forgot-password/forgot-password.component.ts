import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeForgotPasswordComponent } from '../code-forgot-password/code-forgot-password.component';
import { NewPasswordComponent } from '../new-password/new-password.component';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeForgotPasswordComponent, NewPasswordComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  isLoadingMail: any = null;
  isLoadingCode: any = null;

  email!: string;
  code!: string;
  new_password!: string;

  constructor(
    public authService: AuthService,
    public toastr: ToastrService
  ) {

  }

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
        this.toastr.success("Éxito", "Código enviado a tu correo");
      } else if (resp.message == 403 && this.email) {
        this.isLoadingMail = null;
        this.toastr.error("Validación", "Correo no existe");
      }
      if (resp.message == 401) {
        this.toastr.error("Error", "Código ha expirado");
      }
    })
  }
}
