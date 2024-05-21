import { Component, afterNextRender } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

declare function password_show_toggle(): any;
declare function password_show_toggle2(): any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  name!: string;
  surname!: string;
  email!: string;
  password!: string;
  password2!: string;
  phone!: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    afterNextRender(() => {
      setTimeout(() => {
        password_show_toggle();
        password_show_toggle2();
      }, 50);
    })
  }

  register() {
    if (
      !this.name ||
      !this.surname ||
      !this.email ||
      !this.password ||
      !this.password2 ||
      !this.phone
    ) {
      this.toastr.error("Validación", "Necesitas ingresar todos los campos");
      return;
    }

    if (this.password != this.password2) {
      this.toastr.error("Validación", "Las contraseñas no coinciden");
      return;
    }

    let data = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password,
      phone: this.phone
    }
    this.authService.register(data).subscribe((resp: any) => {
      if (resp.error) {
        this.toastr.error("Registro fallido", "Usuario no disponible");
      } else {
        this.toastr.success("Éxito", "Confirma tu correo para continuar con el registro");
        setTimeout(() => {
          this.router.navigateByUrl("/login");
        }, 500);
      }
    });
  }
}